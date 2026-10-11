const {PeerServer}=require('/home/claude/mathack/node_modules/peer');
PeerServer({port:9000,path:'/',host:'0.0.0.0',allow_discovery:false});
console.log('peer server up');
