import { PublicKey } from '@solana/web3.js'
export * from './errors'
export * from './instructions'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'BQqpUU12TqvMm6NRwM9Lv7vKZLWwWzgaZh2Q2qvkmcbi'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
