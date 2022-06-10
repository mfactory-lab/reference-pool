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

import type { ComponentPublicInstance, DirectiveBinding, ObjectDirective } from 'vue'

type DocumentHandler = <T extends MouseEvent>(mouseup: T, mousedown: T) => void

type FlushList = Map<
  HTMLElement,
  {
    documentHandler: DocumentHandler
    bindingFn: (...args: unknown[]) => unknown
  }
>

const isServer = typeof window === 'undefined'
const nodeList: FlushList = new Map()

let startClick: MouseEvent

if (!isServer) {
  document.addEventListener('mousedown', (e: MouseEvent) => (startClick = e), false)
  document.addEventListener(
    'mouseup',
    (e: MouseEvent) => {
      for (const { documentHandler } of nodeList.values()) {
        documentHandler(e, startClick)
      }
    },
    false,
  )
}

function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding): DocumentHandler {
  let excludes: HTMLElement[] = []
  if (Array.isArray(binding.arg)) {
    excludes = binding.arg
  } else {
    // due to current implementation on binding type is wrong the type casting is necessary here
    excludes.push(binding.arg as unknown as HTMLElement)
  }
  return function (mouseup, mousedown) {
    const popperRef = (
      binding.instance as ComponentPublicInstance<{
        popperRef: HTMLElement | null
      }>
    ).popperRef
    const mouseUpTarget = mouseup.target as Node
    const mouseDownTarget = mousedown.target as Node
    const isBound = !binding || !binding.instance
    const isTargetExists = !mouseUpTarget || !mouseDownTarget
    const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget)
    const isSelf = el === mouseUpTarget

    const isTargetExcluded
      = (excludes.length && excludes.some(item => item?.contains(mouseUpTarget)))
      || (excludes.length && excludes.includes(mouseDownTarget as HTMLElement))
    const isContainedByPopper
      = popperRef && (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget))
    if (
      isBound
      || isTargetExists
      || isContainedByEl
      || isSelf
      || isTargetExcluded
      || isContainedByPopper
    ) {
      return
    }
    binding.value()
  }
}

const ClickOutside: ObjectDirective = {
  beforeMount(el, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    })
  },
  updated(el, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    })
  },
  unmounted(el) {
    nodeList.delete(el)
  },
}

export default ClickOutside
