use crate::uint::U256;
use anchor_lang::prelude::*;
use solana_program::{keccak, program::invoke_signed, pubkey};
use spl_associated_token_account::get_associated_token_address;
use spl_token::state::Account as SplAccount;
use tld_house::{assert_initialized, assert_keys_equal, assert_owned_by};

pub fn check_wormhole_mint_account(domain: &str, bns_mint_key: &Pubkey) -> Result<()> {
    let hashed_bns_name = keccak::hashv(&[(domain).as_bytes()]).as_ref().to_vec();
    let hex_encoded: String = hashed_bns_name
        .iter()
        .map(|b| format!("{:02x}", b).to_string())
        .collect::<Vec<String>>()
        .join("");
    let u256_result = hex_encoded.parse::<U256>().unwrap();
    let chain_id = 2_u16;

    // BNS in ETH
    // let token_address =
    //     hex::decode("0000000000000000000000002b2E2629C8Ae7C991E0c3cEcB48b8ab4dc7299f3").unwrap();
    let token_address = vec![
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 46, 38, 41, 200, 174, 124, 153, 30, 12, 60, 236,
        180, 139, 138, 180, 220, 114, 153, 243,
    ];
    let mut token_id = vec![0u8; 32];
    u256_result.to_big_endian(&mut token_id);

    let seeds = vec![
        String::from("wrapped").as_bytes().to_vec(),
        chain_id.to_be_bytes().to_vec(),
        token_address,
        token_id,
    ];
    let s: Vec<&[u8]> = seeds.iter().map(|item| item.as_slice()).collect();
    let seed_slice = s.as_slice();
    let nft_bridge = pubkey!("2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4");
    let (bns_mint_computed, _) = Pubkey::find_program_address(&seed_slice, &nft_bridge);

    assert_keys_equal(bns_mint_computed, *bns_mint_key)?;

    Ok(())
}

pub fn make_ata<'a>(
    ata: AccountInfo<'a>,
    wallet: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    fee_payer: AccountInfo<'a>,
    ata_program: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    // rent: AccountInfo<'a>, not needed anymore
    fee_payer_seeds: &[&[u8]],
) -> Result<()> {
    let as_arr = [fee_payer_seeds];

    let seeds: &[&[&[u8]]] = if !fee_payer_seeds.is_empty() {
        &as_arr
    } else {
        &[]
    };

    invoke_signed(
        &spl_associated_token_account::instruction::create_associated_token_account(
            fee_payer.key,
            wallet.key,
            mint.key,
            token_program.key,
        ),
        &[
            ata,
            wallet,
            mint,
            fee_payer,
            ata_program,
            system_program,
            token_program,
        ],
        seeds,
    )?;

    Ok(())
}

pub fn assert_is_ata_enhanced(
    ata: &AccountInfo,
    wallet: &Pubkey,
    mint: &Pubkey,
    is_token: bool,
    initialized: bool,
) -> Result<()> {
    if initialized {
        let ata_account: SplAccount = assert_initialized(ata)?;
        if !is_token {
            assert_owned_by(ata, &spl_token::id())?;
            assert_keys_equal(ata_account.owner, *wallet)?;
        };
        assert_keys_equal(ata_account.mint, *mint)?;
    }
    assert_keys_equal(get_associated_token_address(wallet, mint), *ata.key)?;
    Ok(())
}
