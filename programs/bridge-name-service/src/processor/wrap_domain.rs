use crate::{constants::*, state::*, utils::*};
use anchor_lang::prelude::*;
use name_house::utils::assert_is_ata_enhanced;
use solana_program::program::invoke;
use {
    alt_name_service::state::NameRecordHeader,
    anchor_spl::{
        associated_token::AssociatedToken,
        token,
        token::{Mint as AnchorMint, Token, TokenAccount},
    },
    name_house::state::{
        AltNameService, MasterEdition, MplTokenMetadata, NameHouse, TokenMetadata,
    },
    solana_program::{msg, pubkey::Pubkey},
    tld_house::{TldHouse, TldState, TldTreasuryManager},
};

/// Accounts for the `create_nft` handler.
#[derive(Accounts)]
#[instruction(
    tld: String,
    hashed_name: Vec<u8>,
    reverse_acc_hashed_name: Vec<u8>,
  )]
pub struct WrapDomain<'info> {
    /// The fee payer account
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: checked by constraints
    #[account(init_if_needed,
      payer=owner,
      space=200,
      seeds=[BNS_PREFIX.as_bytes()],
      bump)]
    pub bns_vault: UncheckedAccount<'info>,

    #[account(
        seeds=[TLD_HOUSE_PDA_SEED.as_bytes()],
        bump,
        seeds::program = tld_house::id())]
    pub tld_state: Box<Account<'info, TldState>>,

    #[account(
        mut,
        seeds=[TLD_HOUSE_PREFIX.as_bytes(), tld.to_lowercase().as_bytes()],
        has_one=authority,
        has_one=treasury_manager,
        bump=tld_house.bump,
        seeds::program = tld_house::id())]
    pub tld_house: Box<Account<'info, TldHouse>>,

    #[account(
        seeds=[TLD_HOUSE_PREFIX.as_bytes(), tld.to_lowercase().as_bytes(), TLD_HOUSE_TREASURY.as_bytes()],
        bump,
        seeds::program = tld_house::id())]
    pub treasury_manager: Box<Account<'info, TldTreasuryManager>>,

    /// CHECK: not needed only for checks. account will be funded to if claimable domain is need
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,

    /// Treasury mint account, either native SOL mint or a SPL token mint.
    /// must exist in treasury manager
    #[account(mut)]
    pub payment_token_mint: Box<Account<'info, AnchorMint>>,

    /// CHECK: checked below
    #[account(mut,
        seeds = [hashed_name.as_ref(), name_class_account.key().as_ref(), name_parent_account.key().as_ref()],
        bump,
        seeds::program = alt_name_service_program.key())]
    pub name_account: UncheckedAccount<'info>,

    /// CHECK: checked below
    #[account(mut,
        seeds = [reverse_acc_hashed_name.as_ref(), tld_house.key().as_ref(), Pubkey::default().as_ref()],
        bump,
        seeds::program = alt_name_service_program.key())]
    pub reverse_name_account: UncheckedAccount<'info>,

    /// The nft mint
    /// CHECK: checked by seed constairnt
    #[account(mut)]
    pub bns_mint_account: Box<Account<'info, AnchorMint>>,
    /// The nft mint
    /// CHECK: checked by seed constairnt
    #[account(mut, constraint=bns_mint_ata_account.mint == bns_mint_account.key())]
    pub bns_mint_ata_account: Account<'info, TokenAccount>,

    /// The nft mint
    /// CHECK: checked by seed constairnt
    #[account(mut)]
    pub ans_mint_account: UncheckedAccount<'info>,

    /// CHECK: safe since almost always pubkey::default()
    pub name_class_account: UncheckedAccount<'info>,
    #[account(mut, constraint = name_parent_account.key() == tld_house.tld_registry_pubkey)]
    pub name_parent_account: Box<Account<'info, NameRecordHeader>>,

    /// CHECK: it is checked below.
    #[account(mut)]
    pub ans_mint_ata_account: UncheckedAccount<'info>,

    // the NFT record account
    /// CHECK: checked in constraints
    #[account(mut,
        seeds=[
            NAME_HOUSE_NFT_RECORD_PREFIX.as_bytes(),
            name_house_account.key().as_ref(),
            name_account.key().as_ref(),], bump,
        seeds::program = name_house_program.key())]
    pub nft_record: UncheckedAccount<'info>,

    #[account(mut, seeds=[COLLECTION_PREFIX.as_bytes(), tld_house.key().as_ref()], bump)]
    pub collection_mint: Box<Account<'info, AnchorMint>>,

    #[account(mut)]
    pub collection_metadata: Box<Account<'info, TokenMetadata>>,

    pub collection_master_edition_account: Box<Account<'info, MasterEdition>>,

    /// CHECK:
    #[account(mut)]
    pub edition_account: UncheckedAccount<'info>,

    /// The metadata account
    /// CHECK: checked below
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// The name house account
    #[account(mut,
        seeds = [NAME_HOUSE_PREFIX.as_bytes(), tld_house.key().as_ref()],
        bump,
        seeds::program = name_house_program.key())]
    pub name_house_account: Box<Account<'info, NameHouse>>,

    // needed if via token
    pub ata_program: Program<'info, AssociatedToken>,

    /// The SPL token program account
    pub token_program: Program<'info, Token>,

    /// The tld house program account
    pub tld_house_program: Program<'info, TldHouseProgram>,
    /// The name house program account
    pub name_house_program: Program<'info, NameHouseProgram>,
    /// The alt name service program account
    pub alt_name_service_program: Program<'info, AltNameService>,

    pub token_metadata_program: Program<'info, MplTokenMetadata>,

    /// The system program account
    pub system_program: Program<'info, System>,
    /// Rent sysvar account
    pub rent: Sysvar<'info, Rent>,
    // WE WILL NEED LUTS
    // next account if purchase is via token
    // payer_ata_account
    // next accounts
    // creators:
    //  - pubkey accounts mutable
    // if via token:
    //  - creator ata account
    // if fixed fee the last remaining account must be:
    //  - tld state funds_pubkey
    // - #[account(address = sysvar::instructions::id())]
    // - instruction_sysvar_account: UncheckedAccount<'info>,
}

pub fn handle_domain_wrapping<'info>(
    ctx: Context<'_, '_, '_, 'info, WrapDomain<'info>>,
    name: String,
    hashed_name: Vec<u8>,
    tld: String,
    space: u32,
    reverse_acc_hashed_name: Vec<u8>,
    th_bump: u8,
    name_parent_bump: u8,
    duration_rate: u16,
    mint_bump: u8,
) -> Result<()> {
    let bns_mint_account = &ctx.accounts.bns_mint_account;
    let tm_bump = ctx.bumps.get("treasury_manager").unwrap();
    let rna_bump = ctx.bumps.get("reverse_name_account").unwrap();
    let ts_bump = ctx.bumps.get("tld_state").unwrap();
    let name_account_bump = ctx.bumps.get("name_account").unwrap();
    let name_house_bump = ctx.bumps.get("name_house_account").unwrap();
    let nft_record_bump = ctx.bumps.get("nft_record").unwrap();
    check_wormhole_mint_account(&name, &bns_mint_account.key())?;
    // first we need to create name account from tld house
    let tld_house_cpi_program = ctx.accounts.tld_house.to_account_info();
    let create_new_name_account_accounts = tld_house::cpi::accounts::BuyOrRenew {
        payer: ctx.accounts.owner.to_account_info(),
        name_owner: ctx.accounts.owner.to_account_info(),
        tld_state: ctx.accounts.tld_state.to_account_info(),
        tld_house: ctx.accounts.tld_house.to_account_info(),
        treasury_manager: ctx.accounts.treasury_manager.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        token_mint: ctx.accounts.payment_token_mint.to_account_info(),
        name_class: ctx.accounts.name_class_account.to_account_info(),
        name_account: ctx.accounts.name_account.to_account_info(),
        name_parent: ctx.accounts.name_parent_account.to_account_info(),
        reverse_name_account: ctx.accounts.reverse_name_account.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        ata_program: ctx.accounts.ata_program.to_account_info(),
        spl_token_program: ctx.accounts.token_program.to_account_info(),
        name_service_program: ctx.accounts.alt_name_service_program.to_account_info(),
    };

    let mut remaining_accounts = ctx.remaining_accounts.to_vec().clone();
    let instructions_sysvar = remaining_accounts.pop().unwrap();
    // create name account cpi
    let create_name_account_cpi_ctx =
        CpiContext::new(tld_house_cpi_program, create_new_name_account_accounts)
            .with_remaining_accounts(remaining_accounts);

    let tld_clone = tld.as_str().clone();
    let hashed_name_clone = hashed_name.as_slice().clone();

    tld_house::cpi::buy_or_extend_renewable(
        create_name_account_cpi_ctx,
        name,
        hashed_name_clone.to_vec(),
        tld_clone.to_string(),
        space,
        reverse_acc_hashed_name,
        th_bump,
        *tm_bump,
        *rna_bump,
        *ts_bump,
        name_parent_bump,
        *name_account_bump,
        duration_rate,
    )?;

    // then name house create mint
    let name_house_cpi_program = ctx.accounts.name_house_program.to_account_info();
    let create_mint_accounts = name_house::cpi::accounts::CreateRenewableMint {
        owner: ctx.accounts.owner.to_account_info(),
        mint_account: ctx.accounts.ans_mint_account.to_account_info(),
        tld_house: ctx.accounts.tld_house.to_account_info(),
        name_class_account: ctx.accounts.name_class_account.to_account_info(),
        name_account: ctx.accounts.name_account.to_account_info(),
        name_parent_account: ctx.accounts.name_parent_account.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        name_house: ctx.accounts.name_house_account.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    // create name account cpi
    let create_mint_cpi_ctx = CpiContext::new(name_house_cpi_program, create_mint_accounts);
    name_house::cpi::create_renewable_mint(
        create_mint_cpi_ctx,
        tld_clone.to_string(),
        *name_house_bump,
        mint_bump,
        th_bump,
    )?;

    // then name house create nft
    let name_house_cpi_program = ctx.accounts.name_house_program.to_account_info();
    let create_nft_accounts = name_house::cpi::accounts::CreateRenewableNft {
        owner: ctx.accounts.owner.to_account_info(),
        mint_account: ctx.accounts.ans_mint_account.to_account_info(),
        tld_house: ctx.accounts.tld_house.to_account_info(),
        name_class_account: ctx.accounts.name_class_account.to_account_info(),
        name_account: ctx.accounts.name_account.to_account_info(),
        name_parent_account: ctx.accounts.name_parent_account.to_account_info(),
        reverse_name_account: ctx.accounts.reverse_name_account.to_account_info(),
        mint_ata_account: ctx.accounts.ans_mint_ata_account.to_account_info(),
        nft_record: ctx.accounts.nft_record.to_account_info(),
        collection_mint: ctx.accounts.collection_mint.to_account_info(),
        collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
        collection_master_edition_account: ctx
            .accounts
            .collection_master_edition_account
            .to_account_info(),
        edition_account: ctx.accounts.edition_account.to_account_info(),
        metadata_account: ctx.accounts.metadata_account.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        name_house: ctx.accounts.name_house_account.to_account_info(),
        spl_token_program: ctx.accounts.token_program.to_account_info(),
        token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
        associated_token_program: ctx.accounts.ata_program.to_account_info(),
        alt_name_service_program: ctx.accounts.alt_name_service_program.to_account_info(),
        instruction_sysvar_account: instructions_sysvar.to_account_info(),
    };
    // create nft account cpi
    let create_nft_cpi_ctx = CpiContext::new(name_house_cpi_program, create_nft_accounts);

    name_house::cpi::create_renewable_nft(
        create_nft_cpi_ctx,
        tld_clone.to_string(),
        hashed_name_clone.to_vec(),
        *name_account_bump,
        *nft_record_bump,
    )?;

    // Transfer token(ownership)
    let token_cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = token::Transfer {
        // bns_ata
        from: ctx.accounts.bns_mint_ata_account.to_account_info(),
        // bns vault
        to: ctx.accounts.bns_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(token_cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, 1)?;

    assert_is_ata_enhanced(
        vault_ata_account,
        &bns_vault.key(),
        &bns_mint_account.key(),
        false,
        false,
    )?;

    create_program_token_account_if_not_present(
        bns_mint_ata_account,
        &ctx.accounts.system_program,
        &ctx.accounts.owner,
        &ctx.accounts.token_program,
        &ctx.accounts.bns_mint_account,
        &ctx.accounts.bns_vault.to_account_info(),
        &ctx.accounts.rent,
        &escrow_signer_seeds,
        fee_seeds,
    )?;

    assert_is_ata_enhanced(
        &ctx.accounts.bns_mint_ata_account,
        &ctx.accounts.owner.key(),
        &bns_mint_account.key(),
        true,
        true,
    )?;
    invoke(
        &spl_token::instruction::transfer(
            ctx.accounts.token_program.key,
            &ctx.accounts.bns_mint_ata_account.key(),
            &ctx.accounts.vault_ata_account.key(),
            &ctx.accounts.owner.key(),
            &[],
            1,
        )?,
        &[
            ctx.accounts.bns_mint_ata_account.to_account_info(),
            ctx.accounts.bns_vault.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.owner.to_account_info(),
        ],
    )?;

    Ok(())
}
