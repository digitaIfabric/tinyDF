makeSig(dispatch) {

  function toHex(s) {
    var hex = '';
    for(var i=0;i<s.length;i++) { hex += ‘’+s.charCodeAt(i).toString(16); }
    return `0x${hex}`;
  }

  var data = toHex('i am a string');
  web3.currentProvider.sendAsync({ id: 1, method: 'personal_sign', params: [web3.eth.accounts[0], data] },
    function(err, result) {
      let sig = result.result;
      dispatch(exchange.authenticate(sig, user));
    })
}
}
render(){
  let { dispatch, _main: { sig } } = this.props;
  if (Object.keys(sig).length == 0) { this.makeSig(dispatch); }
  return (
    <p>I am a webpage</p>
  );
}