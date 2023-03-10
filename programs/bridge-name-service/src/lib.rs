use anchor_lang::prelude::*;
pub mod constants;
pub mod errors;
pub mod pda;
pub mod processor;
pub mod state;
pub mod uint;
pub mod utils;
pub use errors::*;
pub use processor::*;

declare_id!("BQqpUU12TqvMm6NRwM9Lv7vKZLWwWzgaZh2Q2qvkmcbi");

#[program]
pub mod bridge_name_service {
    use super::*;

    pub fn wrap_domain<'info>(
        ctx: Context<'_, '_, '_, 'info, WrapDomain<'info>>,
        tld: String,
        hashed_name: Vec<u8>,
        reverse_acc_hashed_name: Vec<u8>,
        name: String,
        space: u32,
        th_bump: u8,
        name_parent_bump: u8,
        duration_rate: u16,
        mint_bump: u8,
    ) -> Result<()> {
        handle_domain_wrapping(
            ctx,
            name,
            hashed_name,
            tld,
            space,
            reverse_acc_hashed_name,
            th_bump,
            name_parent_bump,
            duration_rate,
            mint_bump,
        )
    }

    pub fn create_nft_ans<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateDomainNFT<'info>>,
        tld: String,
        hashed_name: Vec<u8>,
        _reverse_acc_hashed_name: Vec<u8>,
        name: String,
    ) -> Result<()> {
        handle_domain_nft_creation(ctx, name, hashed_name, tld)
    }
}
