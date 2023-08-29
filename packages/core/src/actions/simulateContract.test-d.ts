import { abi, config } from '@wagmi/test'
import { http, type Address } from 'viem'
import { celo, mainnet } from 'viem/chains'
import { expectTypeOf, test } from 'vitest'

import { createConfig } from '../config.js'
import {
  type SimulateContractParameters,
  type SimulateContractReturnType,
  simulateContract,
} from './simulateContract.js'

test('default', async () => {
  const response = await simulateContract(config, {
    address: '0x',
    abi: abi.erc20,
    functionName: 'transferFrom',
    args: ['0x', '0x', 123n],
    chainId: 1,
  })

  expectTypeOf(response).toMatchTypeOf<{
    result: boolean
    request: {
      __mode: 'prepared'
      chainId: 1
      abi: readonly [
        {
          readonly name: 'transferFrom'
          readonly type: 'function'
          readonly stateMutability: 'nonpayable'
          readonly inputs: readonly [
            { readonly type: 'address'; readonly name: 'sender' },
            { readonly type: 'address'; readonly name: 'recipient' },
            { readonly type: 'uint256'; readonly name: 'amount' },
          ]
          readonly outputs: readonly [{ type: 'bool' }]
        },
      ]
      functionName: 'transferFrom'
      args: readonly [Address, Address, bigint]
    }
  }>()
})

test('chain formatters', () => {
  const config = createConfig({
    chains: [mainnet, celo],
    transports: { [celo.id]: http(), [mainnet.id]: http() },
  })

  type Result = SimulateContractParameters<
    typeof abi.erc20,
    'transferFrom',
    [Address, Address, bigint],
    typeof config
  >
  expectTypeOf<Result>().toMatchTypeOf<{
    chainId?: typeof celo.id | typeof mainnet.id | undefined
    feeCurrency?: `0x${string}` | undefined
    gatewayFee?: bigint | undefined
    gatewayFeeRecipient?: `0x${string}` | undefined
  }>()
  simulateContract(config, {
    address: '0x',
    abi: abi.erc20,
    functionName: 'transferFrom',
    args: ['0x', '0x', 123n],
    feeCurrency: '0x',
    gatewayFee: 100n,
    gatewayFeeRecipient: '0x',
  })

  type Result2 = SimulateContractParameters<
    typeof abi.erc20,
    'transferFrom',
    [Address, Address, bigint],
    typeof config,
    typeof celo.id
  >
  expectTypeOf<Result2>().toMatchTypeOf<{
    functionName: 'approve' | 'transfer' | 'transferFrom'
    args: readonly [Address, Address, bigint]
    feeCurrency?: `0x${string}` | undefined
    gatewayFee?: bigint | undefined
    gatewayFeeRecipient?: `0x${string}` | undefined
  }>()
  simulateContract(config, {
    chainId: celo.id,
    address: '0x',
    abi: abi.erc20,
    functionName: 'transferFrom',
    args: ['0x', '0x', 123n],
    feeCurrency: '0x',
    gatewayFee: 100n,
    gatewayFeeRecipient: '0x',
  })

  type Result3 = SimulateContractParameters<
    typeof abi.erc20,
    'transferFrom',
    [Address, Address, bigint],
    typeof config,
    typeof mainnet.id
  >
  expectTypeOf<Result3>().toMatchTypeOf<{
    functionName: 'approve' | 'transfer' | 'transferFrom'
    args: readonly [Address, Address, bigint]
  }>()
  expectTypeOf<Result3>().not.toMatchTypeOf<{
    feeCurrency?: `0x${string}` | undefined
    gatewayFee?: bigint | undefined
    gatewayFeeRecipient?: `0x${string}` | undefined
  }>()
  simulateContract(config, {
    chainId: mainnet.id,
    address: '0x',
    abi: abi.erc20,
    functionName: 'transferFrom',
    args: ['0x', '0x', 123n],
    // @ts-expect-error
    feeCurrency: '0x',
    gatewayFee: 100n,
    gatewayFeeRecipient: '0x',
  })
})

test('SimulateContractParameters', () => {
  type Result = SimulateContractParameters<
    typeof abi.erc20,
    'transferFrom',
    [Address, Address, bigint],
    typeof config,
    typeof config['chains'][number]['id']
  >
  expectTypeOf<Result>().toMatchTypeOf<{
    chainId?: typeof config['chains'][number]['id'] | undefined
    functionName: 'approve' | 'transfer' | 'transferFrom'
    args: readonly [Address, Address, bigint]
  }>()
})

test('SimulateContractReturnType', () => {
  type Result = SimulateContractReturnType<
    typeof abi.erc20,
    'transferFrom',
    [Address, Address, bigint],
    typeof config,
    typeof config['chains'][number]['id']
  >
  expectTypeOf<Result>().toMatchTypeOf<{
    result: boolean
    request: {
      functionName: 'transferFrom'
      args: readonly [Address, Address, bigint]
      chainId: typeof config['chains'][number]['id']
    }
  }>()
})
