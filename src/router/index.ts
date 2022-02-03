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

import { createMemoryHistory, createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import type { App } from 'vue';

const router = createRouter({
  // history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
  history: import.meta.env.SSR ? createMemoryHistory() : createWebHashHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  strict: true,
  routes,
});

export default router;

// config router
export function setupRouter(app: App) {
  app.use(router);
}
