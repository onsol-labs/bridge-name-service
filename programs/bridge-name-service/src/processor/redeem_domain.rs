use crate::{constants::*, state::*, utils::*};
use anchor_lang::{prelude::*, InstructionData};
use tld_house::AltNameService;
use {
    alt_name_service::state::NameRecordHeader,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint as AnchorMint, Token},
    },
    solana_program::{
        msg,
        program::{invoke, invoke_signed},
        pubkey::Pubkey,
    },
    tld_house::{TldHouse, TldState},
};

/// Accounts for the `create_nft` handler.
#[derive(Accounts)]
#[instruction(
    tld: String,
    hashed_name: Vec<u8>,
  )]
pub struct RedeemNft<'info> {
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

    /// CHECK: checked by seed constraints
    #[account(mut)]
    pub vault_ata_account: UncheckedAccount<'info>,

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

    /// CHECK: checked below
    #[account(mut,
        seeds = [hashed_name.as_ref(), name_class_account.key().as_ref(), name_parent_account.key().as_ref()],
        bump,
        seeds::program = alt_name_service_program.key())]
    pub name_account: UncheckedAccount<'info>,

    /// The nft mint
    /// CHECK: checked by seed constraints below in check_wormhole_mint_account
    #[account(mut)]
    pub bns_mint_account: Box<Account<'info, AnchorMint>>,
    /// The nft mint
    /// CHECK: checked by seed constraints
    #[account(mut)]
    pub bns_mint_ata_account: UncheckedAccount<'info>,

    /// The nft mint
    /// CHECK: checked by seed constraints
    #[account(mut)]
    pub ans_mint_account: UncheckedAccount<'info>,

    /// CHECK: safe since almost always pubkey::default()
    pub name_class_account: UncheckedAccount<'info>,
    #[account(mut, constraint = name_parent_account.key() == tld_house.tld_registry_pubkey)]
    pub name_parent_account: Box<Account<'info, NameRecordHeader>>,

    // needed if via token
    pub ata_program: Program<'info, AssociatedToken>,

    /// The SPL token program account
    pub token_program: Program<'info, Token>,

    /// The tld house program account
    pub tld_house_program: Program<'info, TldHouseProgram>,
    /// The alt name service program account
    pub alt_name_service_program: Program<'info, AltNameService>,

    /// The system program account
    pub system_program: Program<'info, System>,
    /// Rent sysvar account
    pub rent: Sysvar<'info, Rent>,
}

#[inline(never)]
pub fn handle_domain_redeeming<'info>(
    ctx: Context<'_, '_, '_, 'info, RedeemNft<'info>>,
    name: String,
    hashed_name: Vec<u8>,
    tld: String,
    th_bump: u8,
) -> Result<()> {
    msg!("Redeem {}.eth", &name);
    let bns_mint_account = &ctx.accounts.bns_mint_account;
    let ts_bump = ctx.bumps.get("tld_state").unwrap();
    let name_account_bump = ctx.bumps.get("name_account").unwrap();
    let bns_vault_bump = ctx.bumps.get("bns_vault").unwrap();
    check_wormhole_mint_account(&name, &bns_mint_account.key())?;
    // first we need to create name account from tld house
    let tld_house_cpi_program = ctx.accounts.tld_house_program.to_account_info();

    let create_new_name_account_accounts = tld_house::accounts::DeleteRenewable {
        payer: ctx.accounts.owner.key(),
        refund_target: ctx.accounts.owner.key(),
        tld_state: ctx.accounts.tld_state.key(),
        tld_house: ctx.accounts.tld_house.key(),
        name_class: ctx.accounts.name_class_account.key(),
        name_account: ctx.accounts.name_account.key(),
        name_parent: ctx.accounts.name_parent_account.key(),
        system_program: ctx.accounts.system_program.key(),
        name_service_program: ctx.accounts.alt_name_service_program.key(),
    };

    let tld_clone = tld.as_str().clone();
    let hashed_name_clone = hashed_name.as_slice().clone();
    let create_new_name_account_data = tld_house::instruction::DeleteRenewable {
        name,
        hashed_name: hashed_name_clone.to_vec(),
        tld: tld_clone.to_string(),
        _th_bump: th_bump,
        _ts_bump: *ts_bump,
        name_account_bump: *name_account_bump,
    }
    .data();

    let create_name_account_ix = solana_program::instruction::Instruction {
        program_id: tld_house_cpi_program.key(),
        accounts: create_new_name_account_accounts.to_account_metas(Some(false)),
        data: create_new_name_account_data,
    };

    invoke(
        &create_name_account_ix,
        &[
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.tld_state.to_account_info(),
            ctx.accounts.tld_house.to_account_info(),
            ctx.accounts.name_class_account.to_account_info(),
            ctx.accounts.name_account.to_account_info(),
            ctx.accounts.name_parent_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.alt_name_service_program.to_account_info(),
        ],
    )?;

    assert_is_ata_enhanced(
        &ctx.accounts.vault_ata_account.to_account_info(),
        &ctx.accounts.bns_vault.key(),
        &ctx.accounts.bns_mint_account.key(),
        true,
        true,
    )?;

    if ctx.accounts.bns_mint_ata_account.data_is_empty() {
        make_ata(
            ctx.accounts.bns_mint_ata_account.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.bns_mint_account.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.ata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            &[],
        )?;
        assert_is_ata_enhanced(
            &ctx.accounts.bns_mint_ata_account.to_account_info(),
            &ctx.accounts.owner.key(),
            &bns_mint_account.key(),
            false,
            false,
        )?;
    } else {
        assert_is_ata_enhanced(
            &ctx.accounts.bns_mint_ata_account.to_account_info(),
            &ctx.accounts.owner.key(),
            &bns_mint_account.key(),
            true,
            true,
        )?;
    }
    let bns_seeds = &[BNS_PREFIX.as_bytes(), &[*bns_vault_bump]];

    invoke_signed(
        &spl_token::instruction::transfer(
            ctx.accounts.token_program.key,
            &ctx.accounts.vault_ata_account.key(),
            &ctx.accounts.bns_mint_ata_account.key(),
            &ctx.accounts.bns_vault.key(),
            &[],
            1,
        )?,
        &[
            ctx.accounts.bns_mint_ata_account.to_account_info(),
            ctx.accounts.vault_ata_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.bns_vault.to_account_info(),
        ],
        &[bns_seeds],
    )?;

    Ok(())
}
