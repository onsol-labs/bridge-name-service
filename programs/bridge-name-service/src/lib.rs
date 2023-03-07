use anchor_lang::prelude::*;
pub mod errors;
pub mod pda;
pub mod processor;
pub mod state;
use crate::processor::*;
// pub mod utils;

pub use errors::*

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod bridge_name_service {
    use super::*;

    pub fn wrap_domain(ctx: Context<WrapDomain>) -> Result<()> {
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct WrapDomain {}
