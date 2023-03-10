use crate::{constants::*, state::*, utils::*};
use anchor_lang::{prelude::*, InstructionData};
use name_house::utils::assert_is_ata_enhanced;
use solana_program::program::invoke;
use {
    alt_name_service::state::NameRecordHeader,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint as AnchorMint, Token, TokenAccount},
    },
    name_house::state::{
        AltNameService, MasterEdition, MplTokenMetadata, NameHouse, TokenMetadata,
    },
    solana_program::{msg, pubkey::Pubkey, sysvar},
    tld_house::{TldHouse, TldState},
};

/// Accounts for the `create_nft` handler.
#[derive(Accounts)]
#[instruction(
    tld: String,
    hashed_name: Vec<u8>,
    reverse_acc_hashed_name: Vec<u8>,
  )]
pub struct CreateDomainNFT<'info> {
    /// The fee payer account
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds=[TLD_HOUSE_PDA_SEED.as_bytes()],
        bump,
        seeds::program = tld_house::id())]
    pub tld_state: Box<Account<'info, TldState>>,

    #[account(
        mut,
        seeds=[TLD_HOUSE_PREFIX.as_bytes(), tld.to_lowercase().as_bytes()],
        bump=tld_house.bump,
        seeds::program = tld_house::id())]
    pub tld_house: Box<Account<'info, TldHouse>>,

    /// Treasury mint account, either native SOL mint or a SPL token mint.
    /// must exist in treasury manager
    #[account(mut)]
    pub payment_token_mint: Box<Account<'info, AnchorMint>>,

    /// CHECK: checked below
    #[account(mut,
        seeds = [hashed_name.as_ref(), name_class_account.key().as_ref(), name_parent_account.key().as_ref()],
        has_one=owner,
        bump,
        seeds::program = alt_name_service_program.key())]
    pub name_account: Box<Account<'info, NameRecordHeader>>,

    /// CHECK: checked below1
    #[account(mut,
        seeds = [reverse_acc_hashed_name.as_ref(), tld_house.key().as_ref(), Pubkey::default().as_ref()],
        bump,
        seeds::program = alt_name_service_program.key())]
    pub reverse_name_account: UncheckedAccount<'info>,

    /// The nft mint
    /// CHECK: checked by seed constraints below in check_wormhole_mint_account
    #[account(mut)]
    pub bns_mint_account: Box<Account<'info, AnchorMint>>,
    /// The nft mint
    /// CHECK: checked by seed constraints
    #[account(mut, constraint=bns_mint_ata_account.mint == bns_mint_account.key())]
    pub bns_mint_ata_account: Box<Account<'info, TokenAccount>>,

    /// The nft mint
    /// CHECK: checked by seed constraints
    #[account(mut, 
      seeds=[
        NAME_HOUSE_PREFIX.as_bytes(),
        name_house_account.key().as_ref(),
        name_account.key().as_ref(),
        &name_account.expires_at.to_le_bytes(),], bump,
        seeds::program = name_house_program.key())]
    pub ans_mint_account: Box<Account<'info, AnchorMint>>,

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

    #[account(mut, seeds=[COLLECTION_PREFIX.as_bytes(), tld_house.key().as_ref()], 
    bump,
    seeds::program = name_house_program.key())]
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
    /// CHECK: checked in constraints
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: UncheckedAccount<'info>,
}


pub fn handle_domain_nft_creation<'info>(
    ctx: Context<'_, '_, '_, 'info, CreateDomainNFT<'info>>,
    name: String,
    hashed_name: Vec<u8>,
    tld: String,
) -> Result<()> {
    msg!("creating {}.eth nft.", name);
    let bns_mint_account = &ctx.accounts.bns_mint_account;
    let name_account_bump = ctx.bumps.get("name_account").unwrap();
    let nft_record_bump = ctx.bumps.get("nft_record").unwrap();
    check_wormhole_mint_account(&name, &bns_mint_account.key())?;
    assert_is_ata_enhanced(
        &ctx.accounts.ans_mint_ata_account.to_account_info(),
        &ctx.accounts.owner.key(),
        &ctx.accounts.ans_mint_account.key(),
        false,
        false,
    )?;

    // then name house create nft
    let name_house_cpi_program = ctx.accounts.name_house_program.to_account_info();

    let create_renewable_nft_data = name_house::instruction::CreateRenewableNft  {
      hashed_name,
      tld,
      name_account_bump: *name_account_bump,
      nft_record_bump: *nft_record_bump,
    }.data();
    
    let create_renewable_nft_accounts = name_house::accounts::CreateRenewableNft  {
      owner: ctx.accounts.owner.key(),
      mint_account: ctx.accounts.ans_mint_account.key(),
      tld_house: ctx.accounts.tld_house.key(),
      name_class_account: ctx.accounts.name_class_account.key(),
      name_account: ctx.accounts.name_account.key(),
      name_parent_account: ctx.accounts.name_parent_account.key(),
      reverse_name_account: ctx.accounts.reverse_name_account.key(),
      mint_ata_account: ctx.accounts.ans_mint_ata_account.key(),
      nft_record: ctx.accounts.nft_record.key(),
      collection_mint: ctx.accounts.collection_mint.key(),
      collection_metadata: ctx.accounts.collection_metadata.key(),
      collection_master_edition_account: ctx
          .accounts
          .collection_master_edition_account
          .key(),
      edition_account: ctx.accounts.edition_account.key(),
      metadata_account: ctx.accounts.metadata_account.key(),
      system_program: ctx.accounts.system_program.key(),
      name_house: ctx.accounts.name_house_account.key(),
      spl_token_program: ctx.accounts.token_program.key(),
      token_metadata_program: ctx.accounts.token_metadata_program.key(),
      associated_token_program: ctx.accounts.ata_program.key(),
      alt_name_service_program: ctx.accounts.alt_name_service_program.key(),
      instruction_sysvar_account: ctx.accounts.instruction_sysvar_account.key(),
    };

    let create_renewable_nft_ix = solana_program::instruction::Instruction {
      program_id: name_house_cpi_program.key(),
      accounts: create_renewable_nft_accounts.to_account_metas(Some(false)),
      data: create_renewable_nft_data
    };

    invoke(
      &create_renewable_nft_ix,
      &[
        ctx.accounts.owner.to_account_info(),
        ctx.accounts.ans_mint_account.to_account_info(),
        ctx.accounts.tld_house.to_account_info(),
        ctx.accounts.name_class_account.to_account_info(),
        ctx.accounts.name_account.to_account_info(),
        ctx.accounts.name_parent_account.to_account_info(),
        ctx.accounts.reverse_name_account.to_account_info(),
        ctx.accounts.ans_mint_ata_account.to_account_info(),
        ctx.accounts.nft_record.to_account_info(),
        ctx.accounts.collection_mint.to_account_info(),
        ctx.accounts.collection_metadata.to_account_info(),
        ctx.accounts.collection_master_edition_account.to_account_info(),
        ctx.accounts.edition_account.to_account_info(),
        ctx.accounts.metadata_account.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.name_house_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.ata_program.to_account_info(),
        ctx.accounts.alt_name_service_program.to_account_info(),
        ctx.accounts.instruction_sysvar_account.to_account_info()
      ]
    )?;

    Ok(())
}
