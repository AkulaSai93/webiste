/** Code the bot "types" on its screen. Each page section picks one via data-mascot-code. */
export type Snippet = { file: string; code: string };

export const SNIPPETS: Record<string, Snippet> = {
  agent: {
    file: "agent.py",
    code: `# uGNET -> AI-First B.Tech
from sot.ai import Model, Dataset

def train_agent(epochs=12):
    data = Dataset.load("campus-code")
    model = Model("transformer", layers=24)
    for epoch in range(epochs):
        loss = model.fit(data.batch(64))
        print(f"epoch {epoch}: loss={loss:.3f}")
    return model.deploy("cloud")

agent = train_agent()
agent.chat("Hello, future engineer!")`,
  },
  quantum: {
    file: "qubits.py",
    code: `from qiskit import QuantumCircuit

# two qubits, two classical bits
qc = QuantumCircuit(2, 2)
qc.h(0)          # superposition
qc.cx(0, 1)      # entangle
qc.measure([0, 1], [0, 1])

result = run(qc, shots=1024)
print(result.counts())
# {'00': 512, '11': 512}`,
  },
  fullstack: {
    file: "Campus.tsx",
    code: `export default async function Campus() {
  const res = await fetch("/api/projects");
  const projects = await res.json();

  return (
    <Grid cols={3}>
      {projects.map((p) => (
        <Card key={p.id} title={p.name} />
      ))}
    </Grid>
  );
}`,
  },
  blockchain: {
    file: "Campus.sol",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Credentials {
  mapping(address => string) public degree;

  function issue(address s, string memory d) public {
    degree[s] = d;
    emit Issued(s, d);
  }

  event Issued(address student, string degree);
}`,
  },
  security: {
    file: "audit.py",
    code: `import hashlib, secrets

def hash_password(pw: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(pw.encode(), salt=salt.encode(),
                            n=2**14, r=8, p=1)
    return f"{salt}:{digest.hex()}"

for port in scan("campus-net", range(1, 1024)):
    if port.open and not port.allowed:
        alert(f"unexpected service on {port.id}")`,
  },
  cloud: {
    file: "deploy.ts",
    code: `import { Cluster, Service } from "@sot/cloud";

const cluster = new Cluster("campus", {
  regions: ["ap-south-1", "eu-west-1"],
  autoscale: { min: 2, max: 40 },
});

await cluster.deploy(new Service("api", {
  image: "sot/api:latest",
  replicas: 3,
}));

console.log("Live on", cluster.url);`,
  },
  career: {
    file: "placements.ts",
    code: `// every project counts
const offers = students
  .filter((s) => s.projects >= 8)
  .map((s) => match(s, recruiters));

await notify(offers, {
  channel: "placements",
  priority: "high",
});

console.log("Ship it!");`,
  },
};
