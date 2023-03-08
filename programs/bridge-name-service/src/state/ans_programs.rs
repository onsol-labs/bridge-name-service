use anchor_lang::solana_program::pubkey::Pubkey;

#[derive(Clone)]
pub struct NameHouseProgram();

impl anchor_lang::Owner for NameHouseProgram {
    fn owner() -> Pubkey {
        name_house::ID
    }
}

impl anchor_lang::Id for NameHouseProgram {
    fn id() -> Pubkey {
        name_house::ID
    }
}

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
