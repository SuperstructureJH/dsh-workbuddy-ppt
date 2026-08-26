#!/usr/bin/env node

import process from 'node:process'
import { stageWorkBuddyRuntime } from '../lib/runtime-staging.js'

await stageWorkBuddyRuntime(process.argv.slice(2))
