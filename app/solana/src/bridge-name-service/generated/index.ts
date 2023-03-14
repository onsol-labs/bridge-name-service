import { PublicKey } from '@solana/web3.js'
export * from './errors'
export * from './instructions'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'BNSwwSqW7HkAviEjNYhkMKws9jRerzMwb6yvKyYHPeqT'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
