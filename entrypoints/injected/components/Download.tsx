import { useAtomValue } from 'jotai'
import { memo, useEffect, useState } from 'react'
import { Clipboard } from 'react-feather'
import { useCopyToClipboard } from 'usehooks-ts'

import { arrayBufferToBase64, arrayBufferToImageFile } from '@/entrypoints/utils/file'

import { currentSelection, exportExt, exportScale } from '../store'

export const Download = memo((props: { minimized?: boolean }) => {
  const node = useAtomValue(currentSelection)
  const [imageBase64, setImageBase64] = useState('')
  const [svgString, setSvgString] = useState('')
  const scale = useAtomValue(exportScale)
  const ext = useAtomValue(exportExt)

  const [show, setShow] = useState(false)

  const [_, copy] = useCopyToClipboard()

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        figma.notify('Copied to clipboard')
      })
      .catch(() => {
        figma.notify('Failed to copy!', {
          error: true,
        })
      })
  }

  useEffect(() => {
    ;(async () => {
      if (node && show) {
        const data = await node.exportAsync({
          format: 'PNG',
          constraint: {
            type: 'SCALE',
            value: 1,
          },
        })
        setImageBase64('data:image/png;base64,' + arrayBufferToBase64(data))
        setSvgString('')

        if (node.type === 'VECTOR') {
          const svgData = await node.exportAsync({
            format: 'SVG_STRING',
          })
          const svgBase64 = 'data:image/svg+xml;base64,' + btoa(svgData)
          setImageBase64(svgBase64)
          setSvgString(svgData)
        }
      } else {
        setImageBase64('')
      }
    })()
  }, [ext, node, scale, show])

  return (
    <div
      className={`${props.minimized ? 'hidden' : 'block'} p-4 border-t border-#e5e5e5 border-solid text-13px space-y-4`}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1 font-600">Export</span>
        <span className="flex items-center gap-.5 text-xs text-#000/50 cursor-pointer" onClick={() => setShow(!show)}>
          <span className={`w-3 h-3 ${show ? 'rotate-90' : ''} i-fe:play`}></span>
          preview
        </span>
        <span
          className="w-4 h-4 text-#000/50 hover:text-#000 cursor-pointer i-fe:download"
          onClick={async () => {
            const data =
              ext === 'svg'
                ? await node?.exportAsync({
                    format: 'SVG_STRING',
                  })
                : await node?.exportAsync({
                    format: ext.toUpperCase() as 'PNG',
                    constraint: {
                      type: 'SCALE',
                      value: scale,
                    },
                  })
            if (data) {
              arrayBufferToImageFile(
                data,
                node?.name ? `${node?.name}.${ext}` : 'fubukitool.png',
                `image/${ext === 'svg' ? 'svg+xml' : ext}`,
              )
            }
          }}
        ></span>
      </div>
      {imageBase64 && show && (
        <div
          className="mt-4 flex-col-center rounded-sm"
          style={{
            background:
              'conic-gradient(#fff .25turn,#f7f7f7 .25turn .5turn,#fff .5turn .75turn,#f7f7f7 .75turn) top left/20px 20px repeat',
          }}
        >
          <img src={imageBase64} alt="" className="w-full max-w-60 max-h-210px h-auto object-contain" />
        </div>
      )}
      {node?.type === 'VECTOR' && (
        <div className="flex flex-col items-stretch bg-#f5f5f5 rounded-sm overflow-hidden">
          <div className="px-4 h-8 flex-center justify-between border-b border-#e5e5e5 border-solid">
            <span className="text-#000/50 text-xs">svg</span>
            <Clipboard size={16} stroke="rgba(0,0,0,0.5)" className="cursor-pointer" onClick={handleCopy(svgString)} />
          </div>
          <textarea
            value={svgString}
            readOnly
            rows={0}
            autoComplete="off"
            className="px-4 h-auto py-4 lh-4.5 bg-#f5f5f5 cursor-text font-['Roboto_Mono'] text-popover-foreground resize-none scrollbar-hide"
          ></textarea>
        </div>
      )}
    </div>
  )
})
