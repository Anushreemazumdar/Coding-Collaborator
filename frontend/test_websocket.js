import { Client } from '@stomp/stompjs';

// We can test pure websocket connection to ws://localhost:8080/ws-raw
const client = new Client({
  brokerURL: 'ws://localhost:8080/ws-raw',
  reconnectDelay: 0,
  debug: (str) => {
    // console.log(str);
  },
});

let codeReceived = false;
let chatReceived = false;

client.onConnect = (frame) => {
  console.log('STOMP Connected successfully!');

  // Subscribe to code topic
  client.subscribe('/topic/session/1/code', (msg) => {
    console.log('>>> RECEIVED CODE MESSAGE:', JSON.parse(msg.body));
    codeReceived = true;
    checkDone();
  });

  // Subscribe to chat topic
  client.subscribe('/topic/session/1/chat', (msg) => {
    console.log('>>> RECEIVED CHAT MESSAGE:', JSON.parse(msg.body));
    chatReceived = true;
    checkDone();
  });

  setTimeout(() => {
    console.log('Sending Code Change message...');
    client.publish({
      destination: '/app/session/1/code',
      body: JSON.stringify({
        sessionId: 1,
        fileId: 1,
        userId: 1,
        username: 'alice',
        content: 'public class Main { public static void main(String[] args) { System.out.println("Realtime sync verified!"); } }',
      }),
    });

    console.log('Sending Chat message...');
    client.publish({
      destination: '/app/session/1/chat',
      body: JSON.stringify({
        sessionId: 1,
        userId: 1,
        username: 'alice',
        content: 'Check line 15, live chat is working!',
        type: 'CHAT',
      }),
    });
  }, 500);
};

client.onStompError = (frame) => {
  console.error('STOMP Error:', frame);
  process.exit(1);
};

function checkDone() {
  if (codeReceived && chatReceived) {
    console.log('\n======================================================');
    console.log('>>> WEBSOCKET + STOMP REAL-TIME TESTS PASSED 100%! <<<');
    console.log('======================================================\n');
    client.deactivate();
    process.exit(0);
  }
}

client.activate();

setTimeout(() => {
  if (!codeReceived || !chatReceived) {
    console.error('Test timed out. Code received:', codeReceived, 'Chat received:', chatReceived);
    client.deactivate();
    process.exit(1);
  }
}, 6000);
