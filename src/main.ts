/*
 * This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2021, mFactory GmbH
 *
 * Solana Reference Stake Pool is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Solana Reference Stake Pool is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Solana Reference Stake Pool code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@mfactory.ch>.
 */

import { createHead } from '@unhead/vue'
import { createApp } from 'vue'
import { setupRouter } from '~/router'
import App from './App.vue'
import '~/assets/scss/app.scss'

async function bootstrap() {
  const app = createApp(App)
  // eslint-disable-next-line unicorn/no-array-for-each
  Object.values(import.meta.glob('./modules/*.ts', { eager: true })).forEach((i: any) => i.install?.({ app }))

  setupRouter(app)
  const head = createHead()
  app.use(head)
  app.mount('#app')
}

// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap().then()
