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

import type { RouteRecordRaw } from 'vue-router'

const pages = import.meta.glob('../pages/*.vue')

function createRoutes(prefix = '') {
  return Object.keys(pages)
    .map((path) => {
      const matches = path.match(/\.\/pages\/(.*)\.vue$/)
      let name = ''
      if (matches && matches[1]) {
        name = matches[1].toLowerCase()
      }
      return {
        path: ['home', 'index'].includes(name) ? prefix : prefix + name,
        component: pages[path], // () => import('./pages/*.vue')
      }
    })
    .filter(route => !route.path.startsWith('/_'))
}

export default [
  {
    path: '',
    component: () => import('@/layouts/default.vue'),
    children: createRoutes(),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/404.vue'),
    children: [],
  },
] as RouteRecordRaw[]
