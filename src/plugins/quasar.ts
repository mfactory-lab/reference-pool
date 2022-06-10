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

import type { QuasarPluginOptions } from 'quasar'
import { Dark, LocalStorage, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/svg-eva-icons'
import type { App } from 'vue'

// import lang from 'quasar/lang/en-US'
// import 'quasar/src/css/index.sass'
// import '@quasar/extras/eva-icons/eva-icons.css'
// import '@quasar/extras/roboto-font/roboto-font.css'

export const install = ({ app }: { app: App<Element> }) => {
  app.use(Quasar, {
    plugins: {
      Dark,
      Notify,
      LocalStorage,
    },
    iconSet,
  } as QuasarPluginOptions)
}
