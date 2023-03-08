use solana_program::{keccak, pubkey::Pubkey};
use std::{fmt, str::FromStr};
// Large uint types

// required for clippy
// #![allow(clippy::assign_op_pattern)]
// #![allow(clippy::ptr_offset_with_cast)]
// #![allow(clippy::manual_range_contains)]
// #![allow(clippy::reversed_empty_ranges)]

use uint::construct_uint;

construct_uint! {
    pub struct U256(4);
}

fn main() {
    let domain = "onsol";
    // println!("domain: {}", domain);
    // let expected_u256 =
    //     "70317143269701597182549031908999545880112074085677599689528947616344229101368";
    // let expected_hex = "0x9b7617bb25bfcb878dc0de34b0d571bc7a167ac01a78d132a5b7c3e147013f38";
    // println!("expected_u256: {}", expected_u256);
    // println!("expected_hex: {}", expected_hex);
    // let mint_account_expected = "8xaKF8nWzoAbH8Hv7s9pdhKvpYgcMJ4TXhf8tHd2Gdq6";
    let hashed_bns_name = keccak::hashv(&[(domain).as_bytes()]).as_ref().to_vec();
    let hex_result: String = hashed_bns_name
        .iter()
        .map(|b| format!("{:02x}", b).to_string())
        .collect::<Vec<String>>()
        .join("");
    println!("Hex: {}", hex_result);
    let u256_result = hex_result.parse::<U256>().unwrap();
    // let u256_result = hashed_bns_name.parse::<U256>().unwrap();
    // println!("Hex: {}", hex_result);
    println!("u256: {}", u256_result);
    // println!("raw bytes len: {}", hashed_bns_name.len());

    let nft_bridge = Pubkey::from_str("2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4").unwrap();
    let chain_id = 2_u16;
    // let token_address =
    //     hex::decode("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD").unwrap();
    let token_address = vec![
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 250, 83, 161, 77, 61, 143, 93, 162, 83, 240, 224,
        203, 207, 107, 102, 224, 127, 3, 253,
    ];
    // println!("token_address: {:?}", token_address);

    // println!("decoded = {:x}", decoded.unwrap().as_slice().as_ref());
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
    let (mint_account, _) = Pubkey::find_program_address(&seed_slice, &nft_bridge);

    println!("{mint_account:} expected: 8xaKF8nWzoAbH8Hv7s9pdhKvpYgcMJ4TXhf8tHd2Gdq6")
}
