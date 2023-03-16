import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react"

export const dexApi = createApi({
    reducerPath: 'dexApi',
    baseQuery: fetchBaseQuery({baseUrl: 'https://api.1inch.io/v5.0/'}),
    endpoints: (build) => ({
        fetchTokens: build.query({
            query: (chain = 1) => ({
                url: `/${chain}/tokens`
            })
        }),
        fetchApproveAllowance: build.query({
            query: (paramsApproveAllowance) => ({
                url: `/${paramsApproveAllowance.chain}/approve/allowance`,
                params:  {
                    tokenAddress: paramsApproveAllowance.tokenAddress,
                    walletAddress: paramsApproveAllowance.walletAddress
                }
            })
        }),
        fetchApproveTransaction: build.query({
            query: (paramsApproveTransaction) => ({
                url: `/${paramsApproveTransaction.chain}/approve/transaction`,
                params:  {
                    tokenAddress: paramsApproveTransaction.tokenAddress
                }
            })
        }),
        fetchQuote: build.query({
            query: (paramsQuote) => ({
                url: `/${paramsQuote.chain}/quote`,
                params:  {
                    fromTokenAddress: paramsQuote.fromTokenAddress,
                    toTokenAddress: paramsQuote.toTokenAddress,
                    amount: paramsQuote.amount
                }
            })
        }),
        fetchSwap: build.query({
            query: (paramsSwap) => ({
                url: `/${paramsSwap.chain}/swap`,
                params: {
                    fromTokenAddress: paramsSwap.fromTokenAddress,
                    toTokenAddress: paramsSwap.toTokenAddress,
                    amount: paramsSwap.amount,
                    fromAddress: paramsSwap.fromAddress,
                    slippage: paramsSwap.slippage
                }
            })
        })
    })
})