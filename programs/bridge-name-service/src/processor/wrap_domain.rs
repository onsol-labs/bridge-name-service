use crate::{constants::*, state::*, utils::*};
use anchor_lang::{prelude::*, InstructionData};
use solana_program::program::invoke;
use tld_house::AltNameService;
use {
    alt_name_service::state::NameRecordHeader,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint as AnchorMint, Token, TokenAccount},
    },
    solana_program::{msg, pubkey::Pubkey, sysvar},
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
    /// CHECK: checked by seed constraints below in check_wormhole_mint_account
    #[account(mut)]
    pub bns_mint_account: Box<Account<'info, AnchorMint>>,
    /// The nft mint
    /// CHECK: checked by seed constraints
    #[account(mut, constraint=bns_mint_ata_account.mint == bns_mint_account.key())]
    pub bns_mint_ata_account: Box<Account<'info, TokenAccount>>,

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

    /// CHECK: checked by address contraint
    #[account(address = sysvar::instructions::id())]
    pub instruction_sysvar_account: UncheckedAccount<'info>,
}

#[inline(never)]
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
) -> Result<()> {
    msg!("Creating {}.eth", &name);
    let bns_mint_account = &ctx.accounts.bns_mint_account;
    let tm_bump = ctx.bumps.get("treasury_manager").unwrap();
    let rna_bump = ctx.bumps.get("reverse_name_account").unwrap();
    let ts_bump = ctx.bumps.get("tld_state").unwrap();
    let name_account_bump = ctx.bumps.get("name_account").unwrap();
    check_wormhole_mint_account(&name, &bns_mint_account.key())?;

    assert_is_ata_enhanced(
        &ctx.accounts.bns_mint_ata_account.to_account_info(),
        &ctx.accounts.owner.key(),
        &bns_mint_account.key(),
        true,
        true,
    )?;

    // first we need to create name account from tld house
    let tld_house_cpi_program = ctx.accounts.tld_house_program.to_account_info();

    let create_new_name_account_accounts = tld_house::accounts::BuyOrRenew {
        payer: ctx.accounts.owner.key(),
        name_owner: ctx.accounts.owner.key(),
        tld_state: ctx.accounts.tld_state.key(),
        tld_house: ctx.accounts.tld_house.key(),
        treasury_manager: ctx.accounts.treasury_manager.key(),
        authority: ctx.accounts.authority.key(),
        token_mint: ctx.accounts.payment_token_mint.key(),
        name_class: ctx.accounts.name_class_account.key(),
        name_account: ctx.accounts.name_account.key(),
        name_parent: ctx.accounts.name_parent_account.key(),
        reverse_name_account: ctx.accounts.reverse_name_account.key(),
        system_program: ctx.accounts.system_program.key(),
        ata_program: ctx.accounts.ata_program.key(),
        spl_token_program: ctx.accounts.token_program.key(),
        name_service_program: ctx.accounts.alt_name_service_program.key(),
        instruction_sysvar_account: ctx.accounts.instruction_sysvar_account.key(),
    };

    let remaining_accounts = ctx.remaining_accounts.to_vec().clone();
    let remaining_accounts_double_cloned = remaining_accounts.clone();
    // create name account cpi
    let tld_clone = tld.as_str().clone();
    let hashed_name_clone = hashed_name.as_slice().clone();
    let create_new_name_account_data = tld_house::instruction::BuyOrExtendRenewable {
        name,
        hashed_name: hashed_name_clone.to_vec(),
        tld: tld_clone.to_string(),
        space,
        reverse_acc_hashed_name,
        _th_bump: th_bump,
        _tm_bump: *tm_bump,
        _rna_bump: *rna_bump,
        _ts_bump: *ts_bump,
        _name_parent_bump: name_parent_bump,
        _name_account_bump: *name_account_bump,
        duration_rate,
    }
    .data();
    let mut create_name_accounts_with_remaining =
        create_new_name_account_accounts.to_account_metas(Some(false));

    for remaining_account in remaining_accounts {
        let account_meta = AccountMeta {
            pubkey: remaining_account.key(),
            is_signer: false,
            is_writable: remaining_account.is_writable,
        };
        create_name_accounts_with_remaining.push(account_meta)
    }

    let create_name_account_ix = solana_program::instruction::Instruction {
        program_id: tld_house_cpi_program.key(),
        accounts: create_name_accounts_with_remaining,
        data: create_new_name_account_data,
    };
    let tld_state_pubkey = remaining_accounts_double_cloned.last().unwrap();

    invoke(
        &create_name_account_ix,
        &[
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.tld_state.to_account_info(),
            ctx.accounts.tld_house.to_account_info(),
            ctx.accounts.treasury_manager.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payment_token_mint.to_account_info(),
            ctx.accounts.name_class_account.to_account_info(),
            ctx.accounts.name_account.to_account_info(),
            ctx.accounts.name_parent_account.to_account_info(),
            ctx.accounts.reverse_name_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.ata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.alt_name_service_program.to_account_info(),
            ctx.accounts.instruction_sysvar_account.to_account_info(),
            tld_state_pubkey.to_account_info(),
        ],
    )?;

    assert_is_ata_enhanced(
        &ctx.accounts.vault_ata_account.to_account_info(),
        &ctx.accounts.bns_vault.key(),
        &ctx.accounts.bns_mint_account.key(),
        false,
        false,
    )?;

    make_ata(
        ctx.accounts.vault_ata_account.to_account_info(),
        ctx.accounts.bns_vault.to_account_info(),
        ctx.accounts.bns_mint_account.to_account_info(),
        ctx.accounts.owner.to_account_info(),
        ctx.accounts.ata_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        &[],
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
            ctx.accounts.vault_ata_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.owner.to_account_info(),
        ],
    )?;

    Ok(())
}
