use primitive_types::U256;
use sha3::{Digest, Keccak256};

fn main() {
    let domain = "matoken";
    println!("domain: {}", domain);
    let expected_u256 =
        "69845409642262400928105080645461410625829953013136762866921256534530425483455";
    println!("expected_u256: {}", expected_u256);
    let mut hasher = Keccak256::new();
    hasher.update(domain);
    let result = hasher.finalize();
    let hex_result = format!("{:x}", result);
    let u256_result = hex_result.parse::<U256>().unwrap();
    println!("Hex: {}", hex_result);
    println!("u256: {}", u256_result);
    println!("raw bytes len: {}", result.len());
}
