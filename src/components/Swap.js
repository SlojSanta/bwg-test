import React, { useState, useEffect, useMemo } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
import { dexApi } from '../services/DexService';

function Swap(props) {
    const [searchQuery, setSearchQuery] = useState('')
    const { address, isConnected, chain, switchNetwork } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [slippage, setSlippage] = useState(2.5);
    const [tokenOneAmount, setTokenOneAmount] = useState(null);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
    const [tokenOne, setTokenOne] = useState(tokenList.chain_1[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList.chain_1[1]);
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [prices, setPrices] = useState(null);
    const [txDetails, setTxDetails] = useState({
        to:null,
        data: null,
        value: null,
    }); 
    
    const {data: tokens} = dexApi.useFetchTokensQuery(chain && chain.id, {
        skip: !chain
    })

    const {data: quote} = dexApi.useFetchQuoteQuery({chain: chain && chain.id, fromTokenAddress: tokenOne && tokenOne.address, toTokenAddress: tokenTwo && tokenTwo.address, amount: '10000000000000000'}, {
        skip: !chain || !tokenOne || !tokenTwo
    })

    const {data: allowance} = dexApi.useFetchApproveAllowanceQuery({chain: chain && chain.id, tokenAddress: tokenOne && tokenOne.address, walletAddress: address && address}, {
        skip: !chain || !tokenOne || !address
    })

    const {data: approve} = dexApi.useFetchApproveTransactionQuery({chain: chain && chain.id, tokenAddress: tokenOne && tokenOne.address}, {
        skip: !chain || !tokenOne
    })

    const {data: swap, isLoading: swapIsLoading} = dexApi.useFetchSwapQuery({chain: chain && chain.id, fromTokenAddress: tokenOne && tokenOne.address, toTokenAddress: tokenTwo && tokenTwo.address, amount: tokenOneAmount && tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, '0'), fromAddress: address && address, slippage: slippage && slippage}, {
        skip: !chain || !tokenOne || !tokenTwo || !tokenOneAmount || !address || !slippage
    })

    //console.log(swap);

    useEffect(() => {
        if(quote && tokenTwo) {
            const decimals = Number(`1E${tokenTwo.decimals}`)
            setPrices(parseFloat(quote.toTokenAmount)/decimals*100)
        }
    }, [quote])

    const {data, sendTransaction} = useSendTransaction({
        request: {
        from: address,
        to: String(txDetails.to),
        data: String(txDetails.data),
        value: String(txDetails.value),
        }
    })

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    const sortedTokens = useMemo(() => {
        if(tokens) {
            return Object.values(tokens.tokens).filter(token => token.symbol.includes(searchQuery))
        }
    }, [searchQuery, tokens])

    function handleSlippageChange(e) {
        setSlippage(e.target.value);
    }

    function changeAmount(e) {
        setTokenOneAmount(e.target.value);
        if(e.target.value && prices){
        setTokenTwoAmount((e.target.value * prices).toFixed(2))
        }else{
        setTokenTwoAmount(null);
        }
    }

    function openModal(asset) {
        setChangeToken(asset);
        setIsOpen(true);
    }

    function modifyToken(i){
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        if (changeToken === 1) {
        setTokenOne(sortedTokens[i]);
        } else {
        setTokenTwo(sortedTokens[i]);
        }
        setIsOpen(false);
    }

    async function SwitchPrices(){
        setPrices(1/prices)
    }
    
    async function fetchDexSwap() {
        if(allowance && allowance.allowance === "0"){
            setTxDetails(approve);
            console.log("not approved")
            return
        }
        console.log('Swap');

        setTxDetails(swap.tx);
    }

    useEffect(()=>{
        if(chain) {
            setTokenOne(tokenList[`chain_${chain && chain.id}`][0]);
            setTokenTwo(tokenList[`chain_${chain && chain.id}`][1]);
        }
    }, [chain])

//   useEffect(()=>{

//     fetchPrices(tokenList[`chain_${chain.id}`][0].address, tokenList[`chain_${chain.id}`][1].address)

//   }, [])

    useEffect(()=>{

        if(txDetails.to && isConnected){
            sendTransaction();
        }
    }, [txDetails])

    useEffect(()=>{

    messageApi.destroy();

    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isLoading])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }


  },[isSuccess])

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => {setIsOpen(false); setSearchQuery('')}}
        title="Select a token"
      >
        <div className="modalContent">
            <div className="inputs">
            <Input
                placeholder="Search token"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            />
            </div>
            {sortedTokens && sortedTokens.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.logoURI} alt={e.symbol} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.symbol}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          {/* <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div> */}
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.logoURI} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.symbol}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.logoURI} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.symbol}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount || !isConnected || swapIsLoading} onClick={fetchDexSwap}>Swap</div>
      </div>
    </>
  );
}

export default Swap;
