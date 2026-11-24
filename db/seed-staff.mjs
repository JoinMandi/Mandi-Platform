#!/usr/bin/env node
/**
 * Creates a Cognito staff account, adds it to the role group, and upserts the
 * matching web.users row. Run once per staff member from the instance:
 *
 *   docker run --rm --network host --env-file /opt/mandi/.env \
 *     -e PGSSLMODE=require <ecr>:<tag>-migrator \
 *     node db/seed-staff.mjs person@example.com admin
 */
import fs from "node:fs";
import path from "node:path";
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { Client } from "pg";

const [emailArg, roleArg] = process.argv.slice(2);
const email = (emailArg ?? "").trim().toLowerCase();
const role = (roleArg ?? "").trim();
const ROLES = new Set(["member", "clinician", "admin", "superadmin"]);

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ROLES.has(role)) {
  console.error("usage: node db/seed-staff.mjs <email> <member|clinician|admin|superadmin>");
  process.exit(1);
}

const region = process.env.COGNITO_REGION ?? "af-south-1";
const poolId = process.env.COGNITO_USER_POOL_ID;
if (!poolId) {
  console.error("COGNITO_USER_POOL_ID is required");
  process.exit(1);
}

const cognito = new CognitoIdentityProviderClient({ region });

try {
  await cognito.send(
    new AdminCreateUserCommand({
      UserPoolId: poolId,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
      ],
      DesiredDeliveryMediums: ["EMAIL"],
    }),
  );
  console.log(`created Cognito user ${email}`);
} catch (error) {
  const name = error?.name ?? "";
  if (name === "UsernameExistsException") {
    console.log(`Cognito user ${email} already exists`);
  } else {
    throw error;
  }
}

await cognito.send(
  new AdminAddUserToGroupCommand({
    UserPoolId: poolId,
    Username: email,
    GroupName: role,
  }),
);

const user = await cognito.send(
  new AdminGetUserCommand({ UserPoolId: poolId, Username: email }),
);
const sub = user.UserAttributes?.find((a) => a.Name === "sub")?.Value;
if (!sub) throw new Error("Cognito did not return a sub");

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const client = new Client({
  connectionString: url,
  ssl:
    process.env.DATABASE_SSL === "false" || /localhost|127\.0\.0\.1/.test(url)
      ? undefined
      : {
          ca: fs.readFileSync(
            process.env.PGSSLROOTCERT ??
              path.join(process.cwd(), "certs", "global-bundle.pem"),
            "utf8",
          ),
          rejectUnauthorized: true,
        },
});

await client.connect();
try {
  await client.query(
    `insert into web.users (id, email, role, language_code)
     values ($1,$2,$3,'en')
     on conflict (id) do update set role = excluded.role, email = excluded.email`,
    [sub, email, role],
  );
  console.log(`web.users ready: ${email} (${role})`);
} finally {
  await client.end();
}
