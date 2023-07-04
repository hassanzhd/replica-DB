#!/usr/bin/env node

import { ReplicaService } from "./replica_service/ReplicaService";

async function main() {
  const service = ReplicaService.getInstance();
  await service.replicate();
}

if (require.main == module) {
  main();
}
