use crate::{constants::*, cpi::Cpi, errors::NameHouseError, state::*};
use alt_name_service::state::NameRecordHeader;
use anchor_lang::prelude::*;
use {
    anchor_spl::token::Token,
    solana_program::{msg, program::invoke_signed,  program_pack::Pack, pubkey::Pubkey},
    spl_token::{instruction::initialize_mint, state::Mint},
};

/// Accounts for the `create_nft` handler.
#[derive(Accounts)]
#[instruction(
    tld: String,
    name_house_bump: u8,
    mint_bump: u8,
    th_bump: u8)]
pub struct WrapDomain<'info> {
    /// The fee payer account
    #[account(mut)]
    owner: Signer<'info>,

    /// The nft mint
    /// CHECK: checked by seed constairnt
    #[account(mut, 
      seeds=[
        NAME_HOUSE_PREFIX.as_bytes(),
        name_house.key().as_ref(),
        name_account.key().as_ref(),
        &name_account.expires_at.to_le_bytes(),], bump)]
    bns_mint_account: UncheckedAccount<'info>,

    /// The nft mint
    /// CHECK: checked by seed constairnt
    #[account(mut, 
      seeds=[
        NAME_HOUSE_PREFIX.as_bytes(),
        name_house.key().as_ref(),
        name_account.key().as_ref(),
        &name_account.expires_at.to_le_bytes(),], bump)]
    mint_account: UncheckedAccount<'info>,

    #[account(mut, has_one=owner @ NameHouseError::WrongAccountOwner)]
    name_account: Box<Account<'info, NameRecordHeader>>,

    /// CHECK: safe since almost always pubkey::default()
    name_class_account: UncheckedAccount<'info>,
    name_parent_account: Box<Account<'info, NameRecordHeader>>,

    /// The tld house account
    #[account(
        mut,
        seeds=[TLD_HOUSE_PREFIX.as_bytes(), tld.to_lowercase().as_bytes()],
        seeds::program = tld_house::id(),
        bump=th_bump)]
    tld_house: Box<Account<'info, TldHouse>>,

    /// The name house account
    #[account(mut,
        seeds = [NAME_HOUSE_PREFIX.as_bytes(), tld_house.key().as_ref()],
        bump=name_house_bump)]
    name_house: Box<Account<'info, NameHouse>>,

    /// The SPL token program account
    token_program: Program<'info, Token>,

    /// The system program account
    system_program: Program<'info, System>,
    /// Rent sysvar account
    rent: Sysvar<'info, Rent>,
}

pub fn handle_domain_wrapping(
    ctx: Context<WrapDomain>,
    mint_bump: u8
) -> Result<()> {
  let name_house::cpi::instruction::create_mint();
}