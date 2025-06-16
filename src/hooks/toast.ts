import type { PublicOrchestratedToast } from 'bootstrap-vue-next'
import { BToast, useToastController } from 'bootstrap-vue-next'
import attentionIcon from '~/assets/img/icons/attention-circle.svg?raw'
import dangerIcon from '~/assets/img/icons/danger-icon.svg?raw'
import checkIcon from '~/assets/img/icons/toast-check-icon.svg?raw'

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

export type ToastProps = {
  message?: string
  title?: string
  actions?: Array<{
    label: string
    color?: string
    target?: string
    class?: string
    href?: string
    onClick?: () => void
  }>
  noCloseButton: boolean
} & PublicOrchestratedToast

export function useToast() {
  const { show, remove } = useToastController()

  /**
   * value @type {number}
   * - `Infinity` — not auto close
   * - `1000` —  close after 1000 ms
   * progressProps
   * @type {Partial<ProgressProps>}
   * { variant: 'success' | 'info' | 'warning' | 'danger' }
   */
  function create({
    message = '',
    pos = 'bottom-center',
    variant = 'success',
    value = 5000,
    toastClass = '',
    noHoverPause = false,
    noCloseButton = false,
    actions = [],
    ...args
  }: Partial<ToastProps> = {}) {
    const iconMap: Record<string, string> = {
      success: checkIcon,
      info: attentionIcon,
      warning: attentionIcon,
      danger: dangerIcon,
    }

    const classMap: Record<string, string> = {
      success: 'toast-success',
      info: 'toast-info',
      warning: 'toast-warning',
      danger: 'toast-danger',
    }

    const props: PublicOrchestratedToast = {
      pos,
      value: Number(value) > 0 ? value : Infinity,
      toastClass: `${toastClass} ${classMap[variant!] || ''}`,
      noHoverPause,
      noCloseButton,
      title: '',
      ...args,
    }

    // @ts-expect-error...
    const toastInstance = show({
      props,
      component: h(BToast, null, {
        default: () =>
          h('div', { class: 'toast-wrapper' }, [
            h('div', { class: 'toast-content' }, [
              h('div', { class: 'toast-icon', innerHTML: iconMap[variant!] }),
              h('div', { class: 'toast-message', innerHTML: `${args.title ? `<div class="toast-title">${args.title}</div>` : ''} ${message}` }),
              !noCloseButton && h('yb', {
                class: 'btn-close',
                onClick: () => {
                  // @ts-expect-error...
                  remove(toastInstance)
                },
              }),
            ]),
            actions.length > 0
            && h('div', { class: 'toast-actions' },
              actions.map(action =>
                h(
                  'a',
                  {
                    class: `toast-action ${action?.class || ''}`,
                    href: action?.href || '#',
                    target: action?.target || '_self',
                    style: { color: action?.color || 'inherit' },
                    onClick: (event) => {
                      if (action.onClick) {
                        event.preventDefault()
                        action.onClick()
                        // @ts-expect-error...
                        remove(toastInstance)
                      }
                    },
                  },
                  action.label,
                ),
              ),
            ),
          ]),
      }),
    })

    return {
      // @ts-expect-error...
      dismiss: () => remove(toastInstance),
    }
  }

  return {
    create,
  }
}
