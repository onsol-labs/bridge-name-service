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

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

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
}
