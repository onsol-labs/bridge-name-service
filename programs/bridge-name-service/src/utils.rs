use crate::uint::U256;
use anchor_lang::prelude::*;
use solana_program::{keccak, program::invoke_signed, pubkey};
use tld_house::assert_keys_equal;

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
    //     hex::decode("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD").unwrap();
    let token_address = vec![
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 250, 83, 161, 77, 61, 143, 93, 162, 83, 240, 224,
        203, 207, 107, 102, 224, 127, 3, 253,
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
