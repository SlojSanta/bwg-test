import React from "react";
import { Popover, Radio} from "antd";

function Header(props) {

  const {address, isConnected, connect, chain, switchNetwork} = props;

  function handleSwitchNetworkChange(e) {
    switchNetwork(e.target.value)
  }

  const settings = (
    <>
      <div>
        <Radio.Group onChange={handleSwitchNetworkChange}>
          <Radio.Button value={1}>Ethereum</Radio.Button>
          <Radio.Button value={137}>Polygon</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <header>
      <div className="rightH">
        <Popover 
        content={settings}
        title="Network"
        trigger="click"
        className="headerItem"
        >
          {/* <img src={network.logo} alt="eth" className="eth" /> */}
          {chain? chain.name : 'Connect to wallet'}
        </Popover>
        <div className="connectButton" onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
