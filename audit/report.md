# solana-narrative-hunter audit
date: 2026-02-11T13:16:39+00:00

## Environment
node: v24.11.1
pnpm: 9.1.0
python: Python 3.12.1
git: git version 2.52.0

## Lockfile
❌ pnpm-lock.yaml MISSING (CI with --frozen-lockfile will fail)

## Workflows
(no workflows dir)

## .gitignore report rules

## Known-risk greps
### new URL(...)

### archiver / zip route

### runtime / fs / child_process in API routes

### worker demo fallback / live mode switches

### z_score impl

## pnpm install

Scope: all 3 workspace projects
Progress: resolved 1, reused 0, downloaded 0, added 0
Progress: resolved 20, reused 0, downloaded 13, added 0
apps/web                                 |  WARN  deprecated next@14.2.3
Progress: resolved 22, reused 0, downloaded 20, added 0
Progress: resolved 42, reused 0, downloaded 24, added 0
Progress: resolved 75, reused 0, downloaded 24, added 0
Progress: resolved 130, reused 0, downloaded 69, added 0
Progress: resolved 163, reused 0, downloaded 102, added 0
Progress: resolved 166, reused 0, downloaded 102, added 0
Progress: resolved 171, reused 0, downloaded 107, added 0
Progress: resolved 233, reused 0, downloaded 107, added 0
 WARN  1 deprecated subdependencies found: glob@10.5.0
Packages: +201
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 234, reused 0, downloaded 132, added 29
Progress: resolved 234, reused 0, downloaded 153, added 142
Progress: resolved 234, reused 0, downloaded 201, added 201, done
.../node_modules/@prisma/engines postinstall$ node scripts/postinstall.js
.../esbuild@0.27.3/node_modules/esbuild postinstall$ node install.js
.../esbuild@0.27.3/node_modules/esbuild postinstall: Done
.../node_modules/@prisma/engines postinstall: Done
.../prisma@5.22.0/node_modules/prisma preinstall$ node scripts/preinstall-entry.js
.../prisma@5.22.0/node_modules/prisma preinstall: Done
.../node_modules/@prisma/client postinstall$ node scripts/postinstall.js
.../node_modules/@prisma/client postinstall: prisma:warn We could not find your Prisma schema in the default locations (see: https://pris.ly/d/prisma-schema-location).
.../node_modules/@prisma/client postinstall: If you have a Prisma schema file in a custom path, you will need to run
.../node_modules/@prisma/client postinstall: `prisma generate --schema=./path/to/your/schema.prisma` to generate Prisma Client.
.../node_modules/@prisma/client postinstall: If you do not have a Prisma schema file yet, you can ignore this message.
.../node_modules/@prisma/client postinstall: Done

devDependencies:
+ prettier 3.8.1
+ prettier-plugin-tailwindcss 0.5.14 (0.7.2 is available)

Done in 20.3s

## lint


> solana-narrative-hunter@ lint /workspaces/Trailblazer
> pnpm --filter web lint


> web@0.1.0 lint /workspaces/Trailblazer/apps/web
> next lint

? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
[?25l❯  Strict (recommended)
   Base
   Cancel[2K[1A[2K[1A[2K[G[?25h
Installing devDependencies (pnpm):
- eslint@^8
- eslint-config-next

 WARN  deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
../..                                    | Progress: resolved 1, reused 0, downloaded 0, added 0
 WARN  deprecated next@14.2.3: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
../..                                    | Progress: resolved 129, reused 81, downloaded 2, added 0
../..                                    | Progress: resolved 299, reused 178, downloaded 72, added 0
../..                                    | Progress: resolved 379, reused 188, downloaded 122, added 0
../..                                    | Progress: resolved 467, reused 193, downloaded 206, added 0
../..                                    | Progress: resolved 514, reused 201, downloaded 263, added 0
../..                                    | Progress: resolved 515, reused 201, downloaded 263, added 0
 WARN  6 deprecated subdependencies found: @humanwhocodes/config-array@0.13.0, @humanwhocodes/object-schema@2.0.3, glob@10.5.0, glob@7.2.3, inflight@1.0.6, rimraf@3.0.2
../..                                    | +261   -2 ++++++++++++++++++++++++++-
../..                                    | Progress: resolved 515, reused 201, downloaded 264, added 261, done
.../node_modules/unrs-resolver postinstall$ napi-postinstall unrs-resolver 1.11.1 check
.../node_modules/unrs-resolver postinstall: Done

devDependencies:
+ eslint 8.57.1 (10.0.0 is available) deprecated
+ eslint-config-next 16.1.6

 WARN  Issues with peer dependencies found
apps/web
└─┬ eslint-config-next 16.1.6
  └── ✕ unmet peer eslint@>=9.0.0: found 8.57.1

Done in 8.5s

We created the .eslintrc.json file for you and included your selected configuration.
 ▲ ESLint has successfully been configured. Run next lint again to view warnings and errors.
/workspaces/Trailblazer/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  web@0.1.0 lint: `next lint`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.

## typecheck

undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "typecheck" not found

## build


> solana-narrative-hunter@ build /workspaces/Trailblazer
> pnpm --filter web build


> web@0.1.0 build /workspaces/Trailblazer/apps/web
> next build

Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

  ▲ Next.js 14.2.3

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ⨯ ESLint: Converting circular structure to JSON     --> starting at object with constructor 'Object'     |     property 'configs' -> object with constructor 'Object'     |     property 'flat' -> object with constructor 'Object'     |     ...     |     property 'plugins' -> object with constructor 'Object'     --- property 'react' closes the circle Referenced from: /workspaces/Trailblazer/apps/web/.eslintrc.json
Failed to compile.

./src/app/narratives/[id]/page.tsx:30:51
Type error: Parameter 's' implicitly has an 'any' type.

[0m [90m 28 |[39m   [36mif[39m ([33m![39mnarrative) [36mreturn[39m notFound()[33m;[39m[0m
[0m [90m 29 |[39m[0m
[0m[31m[1m>[22m[39m[90m 30 |[39m   [36mconst[39m steps [33m=[39m narrative[33m.[39minvestigationSteps[33m.[39mmap((s) [33m=>[39m ({[0m
[0m [90m    |[39m                                                   [31m[1m^[22m[39m[0m
[0m [90m 31 |[39m     id[33m:[39m s[33m.[39mid[33m,[39m[0m
[0m [90m 32 |[39m     stepIndex[33m:[39m s[33m.[39mstepIndex[33m,[39m[0m
[0m [90m 33 |[39m     tool[33m:[39m s[33m.[39mtool[33m,[39m[0m
/workspaces/Trailblazer/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  web@0.1.0 build: `next build`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.

## DB up


> solana-narrative-hunter@ db:up /workspaces/Trailblazer
> docker compose up -d postgres

time="2026-02-11T13:20:22Z" level=warning msg="/workspaces/Trailblazer/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
 postgres Pulling 
 4831516dd0cb Pulling fs layer 
 1dc660d92d1e Pulling fs layer 
 343edefd4488 Pulling fs layer 
 28c4628bb902 Pulling fs layer 
 8e2c6e662535 Pulling fs layer 
 fd82c7e84e48 Pulling fs layer 
 00dff38d0051 Pulling fs layer 
 462f835eff3c Pulling fs layer 
 024e99ecf4af Pulling fs layer 
 9256ecf73e73 Pulling fs layer 
 8b0ee077867c Pulling fs layer 
 220f2e4b9c0d Pulling fs layer 
 71f7fc88fabf Pulling fs layer 
 cb31571efe69 Pulling fs layer 
 3d1ed11f1475 Pulling fs layer 
 7bd94365687e Pulling fs layer 
 024e99ecf4af Waiting 
 9256ecf73e73 Waiting 
 8b0ee077867c Waiting 
 220f2e4b9c0d Waiting 
 71f7fc88fabf Waiting 
 cb31571efe69 Waiting 
 3d1ed11f1475 Waiting 
 7bd94365687e Waiting 
 fd82c7e84e48 Waiting 
 00dff38d0051 Waiting 
 462f835eff3c Waiting 
 28c4628bb902 Waiting 
 8e2c6e662535 Waiting 
 4831516dd0cb Downloading [>                                                  ]  286.7kB/28.23MB
 1dc660d92d1e Downloading [==============================>                    ]     708B/1.169kB
 1dc660d92d1e Downloading [==================================================>]  1.169kB/1.169kB
 1dc660d92d1e Verifying Checksum 
 1dc660d92d1e Download complete 
 343edefd4488 Downloading [>                                                  ]  46.31kB/4.534MB
 4831516dd0cb Downloading [===============================>                   ]  17.69MB/28.23MB
 343edefd4488 Verifying Checksum 
 343edefd4488 Download complete 
 4831516dd0cb Verifying Checksum 
 4831516dd0cb Download complete 
 4831516dd0cb Extracting [>                                                  ]  294.9kB/28.23MB
 28c4628bb902 Downloading [>                                                  ]  13.02kB/1.25MB
 4831516dd0cb Extracting [========>                                          ]  5.014MB/28.23MB
 28c4628bb902 Downloading [==================================================>]   1.25MB/1.25MB
 28c4628bb902 Verifying Checksum 
 28c4628bb902 Download complete 
 8e2c6e662535 Downloading [>                                                  ]  80.68kB/8.066MB
 4831516dd0cb Extracting [================>                                  ]  9.142MB/28.23MB
 fd82c7e84e48 Downloading [>                                                  ]  13.02kB/1.196MB
 fd82c7e84e48 Verifying Checksum 
 fd82c7e84e48 Download complete 
 8e2c6e662535 Downloading [====================>                              ]  3.381MB/8.066MB
 4831516dd0cb Extracting [======================>                            ]  12.68MB/28.23MB
 8e2c6e662535 Verifying Checksum 
 8e2c6e662535 Download complete 
 4831516dd0cb Extracting [=================================>                 ]  18.87MB/28.23MB
 00dff38d0051 Downloading [==================================================>]     116B/116B
 00dff38d0051 Verifying Checksum 
 00dff38d0051 Download complete 
 4831516dd0cb Extracting [=======================================>           ]  22.41MB/28.23MB
 462f835eff3c Downloading [===========>                                       ]     700B/3.141kB
 462f835eff3c Downloading [==================================================>]  3.141kB/3.141kB
 462f835eff3c Verifying Checksum 
 462f835eff3c Download complete 
 024e99ecf4af Downloading [>                                                  ]  540.7kB/111.7MB
 4831516dd0cb Extracting [==========================================>        ]  23.89MB/28.23MB
 9256ecf73e73 Downloading [===>                                               ]     688B/9.919kB
 9256ecf73e73 Downloading [==================================================>]  9.919kB/9.919kB
 9256ecf73e73 Verifying Checksum 
 9256ecf73e73 Download complete 
 024e99ecf4af Downloading [=======>                                           ]  16.01MB/111.7MB
 4831516dd0cb Extracting [===============================================>   ]  26.84MB/28.23MB
 024e99ecf4af Downloading [==============>                                    ]  31.55MB/111.7MB
 8b0ee077867c Downloading [==================================================>]     128B/128B
 8b0ee077867c Verifying Checksum 
 8b0ee077867c Download complete 
 024e99ecf4af Downloading [==================>                                ]  42.25MB/111.7MB
 220f2e4b9c0d Downloading [==================================================>]     168B/168B
 220f2e4b9c0d Download complete 
 024e99ecf4af Downloading [=========================>                         ]   57.8MB/111.7MB
 4831516dd0cb Extracting [================================================>  ]  27.43MB/28.23MB
 71f7fc88fabf Downloading [======>                                            ]     720B/5.839kB
 71f7fc88fabf Downloading [==================================================>]  5.839kB/5.839kB
 71f7fc88fabf Verifying Checksum 
 71f7fc88fabf Download complete 
 024e99ecf4af Downloading [================================>                  ]  72.78MB/111.7MB
 4831516dd0cb Extracting [==================================================>]  28.23MB/28.23MB
 024e99ecf4af Downloading [=====================================>             ]  83.46MB/111.7MB
 4831516dd0cb Pull complete 
 1dc660d92d1e Extracting [==================================================>]  1.169kB/1.169kB
 1dc660d92d1e Extracting [==================================================>]  1.169kB/1.169kB
 cb31571efe69 Downloading [==================================================>]     186B/186B
 cb31571efe69 Verifying Checksum 
 cb31571efe69 Download complete 
 024e99ecf4af Downloading [============================================>      ]  98.46MB/111.7MB
 3d1ed11f1475 Downloading [>                                                  ]  2.087kB/123.1kB
 3d1ed11f1475 Verifying Checksum 
 3d1ed11f1475 Download complete 
 024e99ecf4af Downloading [================================================>  ]  109.2MB/111.7MB
 024e99ecf4af Verifying Checksum 
 024e99ecf4af Download complete 
 7bd94365687e Downloading [>                                                  ]  9.561kB/918.7kB
 7bd94365687e Downloading [==================================================>]  918.7kB/918.7kB
 7bd94365687e Verifying Checksum 
 7bd94365687e Download complete 
 1dc660d92d1e Pull complete 
 343edefd4488 Extracting [>                                                  ]  65.54kB/4.534MB
 343edefd4488 Extracting [==================================================>]  4.534MB/4.534MB
 343edefd4488 Pull complete 
 28c4628bb902 Extracting [=>                                                 ]  32.77kB/1.25MB
 28c4628bb902 Extracting [==================================================>]   1.25MB/1.25MB
 28c4628bb902 Pull complete 
 8e2c6e662535 Extracting [>                                                  ]   98.3kB/8.066MB
 8e2c6e662535 Extracting [========================>                          ]  3.932MB/8.066MB
 8e2c6e662535 Extracting [=====================================>             ]  5.997MB/8.066MB
 8e2c6e662535 Extracting [==================================================>]  8.066MB/8.066MB
 8e2c6e662535 Pull complete 
 fd82c7e84e48 Extracting [=>                                                 ]  32.77kB/1.196MB
 fd82c7e84e48 Extracting [==================================================>]  1.196MB/1.196MB
 fd82c7e84e48 Extracting [==================================================>]  1.196MB/1.196MB
 fd82c7e84e48 Pull complete 
 00dff38d0051 Extracting [==================================================>]     116B/116B
 00dff38d0051 Extracting [==================================================>]     116B/116B
 00dff38d0051 Pull complete 
 462f835eff3c Extracting [==================================================>]  3.141kB/3.141kB
 462f835eff3c Extracting [==================================================>]  3.141kB/3.141kB
 462f835eff3c Pull complete 
 024e99ecf4af Extracting [>                                                  ]  557.1kB/111.7MB
 024e99ecf4af Extracting [==>                                                ]  6.685MB/111.7MB
 024e99ecf4af Extracting [====>                                              ]  10.03MB/111.7MB
 024e99ecf4af Extracting [======>                                            ]  15.04MB/111.7MB
 024e99ecf4af Extracting [=========>                                         ]  20.61MB/111.7MB
 024e99ecf4af Extracting [===========>                                       ]  25.07MB/111.7MB
 024e99ecf4af Extracting [==============>                                    ]  32.87MB/111.7MB
 024e99ecf4af Extracting [=================>                                 ]  38.99MB/111.7MB
 024e99ecf4af Extracting [====================>                              ]  45.12MB/111.7MB
 024e99ecf4af Extracting [=======================>                           ]  52.36MB/111.7MB
 024e99ecf4af Extracting [========================>                          ]  55.71MB/111.7MB
 024e99ecf4af Extracting [===========================>                       ]  60.72MB/111.7MB
 024e99ecf4af Extracting [==============================>                    ]  68.52MB/111.7MB
 024e99ecf4af Extracting [=================================>                 ]  74.09MB/111.7MB
 024e99ecf4af Extracting [===================================>               ]  79.66MB/111.7MB
 024e99ecf4af Extracting [=====================================>             ]  84.12MB/111.7MB
 024e99ecf4af Extracting [========================================>          ]  91.36MB/111.7MB
 024e99ecf4af Extracting [==========================================>        ]  95.81MB/111.7MB
 024e99ecf4af Extracting [============================================>      ]  99.71MB/111.7MB
 024e99ecf4af Extracting [==============================================>    ]  103.1MB/111.7MB
 024e99ecf4af Extracting [===============================================>   ]  105.8MB/111.7MB
 024e99ecf4af Extracting [================================================>  ]  107.5MB/111.7MB
 024e99ecf4af Extracting [================================================>  ]  109.2MB/111.7MB
 024e99ecf4af Extracting [=================================================> ]  110.3MB/111.7MB
 024e99ecf4af Extracting [==================================================>]  111.7MB/111.7MB
 024e99ecf4af Pull complete 
 9256ecf73e73 Extracting [==================================================>]  9.919kB/9.919kB
 9256ecf73e73 Extracting [==================================================>]  9.919kB/9.919kB
 9256ecf73e73 Pull complete 
 8b0ee077867c Extracting [==================================================>]     128B/128B
 8b0ee077867c Extracting [==================================================>]     128B/128B
 8b0ee077867c Pull complete 
 220f2e4b9c0d Extracting [==================================================>]     168B/168B
 220f2e4b9c0d Extracting [==================================================>]     168B/168B
 220f2e4b9c0d Pull complete 
 71f7fc88fabf Extracting [==================================================>]  5.839kB/5.839kB
 71f7fc88fabf Extracting [==================================================>]  5.839kB/5.839kB
 71f7fc88fabf Pull complete 
 cb31571efe69 Extracting [==================================================>]     186B/186B
 cb31571efe69 Extracting [==================================================>]     186B/186B
 cb31571efe69 Pull complete 
 3d1ed11f1475 Extracting [=============>                                     ]  32.77kB/123.1kB
 3d1ed11f1475 Extracting [==================================================>]  123.1kB/123.1kB
 3d1ed11f1475 Pull complete 
 7bd94365687e Extracting [=>                                                 ]  32.77kB/918.7kB
 7bd94365687e Extracting [==================================================>]  918.7kB/918.7kB
 7bd94365687e Pull complete 
 postgres Pulled 
 Network trailblazer_default  Creating
 Network trailblazer_default  Created
 Volume trailblazer_pgdata  Creating
 Volume trailblazer_pgdata  Created
 Container narrative-hunter-db  Creating
 Container narrative-hunter-db  Created
 Container narrative-hunter-db  Starting
 Container narrative-hunter-db  Started

## Prisma push


> solana-narrative-hunter@ db:push /workspaces/Trailblazer
> pnpm --filter web prisma:push


> web@0.1.0 prisma:push /workspaces/Trailblazer/apps/web
> prisma db push

Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
  -->  prisma/schema.prisma:7
   | 
 6 |   provider = "postgresql"
 7 |   url      = env("DATABASE_URL")
   | 

Validation Error Count: 1
[Context: getConfig]

Prisma CLI Version : 5.22.0
/workspaces/Trailblazer/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  web@0.1.0 prisma:push: `prisma db push`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.

## Seed demo


> solana-narrative-hunter@ seed:demo /workspaces/Trailblazer
> pnpm --filter web seed


> web@0.1.0 seed /workspaces/Trailblazer/apps/web
> tsx scripts/seed.ts

/workspaces/Trailblazer/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/default.js:43
    throw new Error('@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.');
          ^

Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
    at new PrismaClient (/workspaces/Trailblazer/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/default.js:43:11)
    at <anonymous> (/workspaces/Trailblazer/apps/web/scripts/seed.ts:17:16)
    at Object.<anonymous> (/workspaces/Trailblazer/apps/web/scripts/seed.ts:516:38)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object.transformer (/workspaces/Trailblazer/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:336:3)

Node.js v24.11.1
/workspaces/Trailblazer/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  web@0.1.0 seed: `tsx scripts/seed.ts`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.

## Worker run


> solana-narrative-hunter@ worker:run /workspaces/Trailblazer
> cd worker && python3 run_fortnight.py

Traceback (most recent call last):
  File "/workspaces/Trailblazer/worker/run_fortnight.py", line 27, in <module>
    from config import (
  File "/workspaces/Trailblazer/worker/config.py", line 7, in <module>
    from dotenv import load_dotenv
ModuleNotFoundError: No module named 'dotenv'
 ELIFECYCLE  Command failed with exit code 1.
