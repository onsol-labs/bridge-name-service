use anchor_lang::solana_program::pubkey::Pubkey;

#[derive(Clone)]
pub struct TldHouseProgram();

impl anchor_lang::Owner for TldHouseProgram {
    fn owner() -> Pubkey {
        tld_house::ID
    }
}

impl anchor_lang::Id for TldHouseProgram {
    fn id() -> Pubkey {
        tld_house::ID
    }
}
