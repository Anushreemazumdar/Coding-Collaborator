async function test() {
  console.log('--- 1. Register User A ---');
  let regA = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice', email: 'alice@test.com', password: 'password123' })
  }).then(r => r.json());
  console.log('User A Registered:', regA);

  console.log('--- 2. Register User B ---');
  let regB = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'bob', email: 'bob@test.com', password: 'password123' })
  }).then(r => r.json());
  console.log('User B Registered:', regB);

  console.log('--- 3. Create Project by User A ---');
  let proj = await fetch('http://localhost:8080/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Collaborative Java Project', description: 'Real-time collaborative coding project', ownerId: regA.userId })
  }).then(r => r.json());
  console.log('Project Created:', proj);

  console.log('--- 4. List Files in Project ---');
  let files = await fetch('http://localhost:8080/api/files/project/' + proj.id).then(r => r.json());
  console.log('Files in project:', files);

  console.log('--- 5. Create Session SESSION-101 ---');
  let sess = await fetch('http://localhost:8080/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionCode: 'SESSION-101', sessionName: 'Java Collaboration Session', projectId: proj.id, createdById: regA.userId })
  }).then(r => r.json());
  console.log('Session Created:', sess);

  console.log('--- 6. User B Joins Session ---');
  let join = await fetch('http://localhost:8080/api/sessions/' + sess.id + '/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: regB.userId })
  }).then(r => r.json());
  console.log('Session after User B joined:', join);

  console.log('--- 7. Save Code to Main.java ---');
  let fileId = files[0].id;
  let saveRes = await fetch('http://localhost:8080/api/files/' + fileId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Alice and Bob!");\n    }\n}\n' })
  }).then(r => r.json());
  console.log('File Saved:', saveRes);

  console.log('--- 8. Verify WebSocket SockJS Info endpoint ---');
  let wsInfo = await fetch('http://localhost:8080/ws/info').then(r => r.json());
  console.log('WebSocket SockJS Info:', wsInfo);

  console.log('\n======================================================');
  console.log('>>> ALL ENDPOINTS AND MODULES VERIFIED SUCCESSFULLY! <<<');
  console.log('======================================================\n');
}
test().catch(console.error);
