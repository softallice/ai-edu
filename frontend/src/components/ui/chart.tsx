import * as React from 'react'
import { Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

// ─── ChartConfig ─────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: { light: string; dark: string }
  }
>

// ─── Context ─────────────────────────────────────────────────────────────────

type ChartContextValue = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be used within ChartContainer')
  return ctx
}

// ─── ChartStyle ──────────────────────────────────────────────────────────────

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color || cfg.theme)
  if (!colorConfig.length) return null

  const css = colorConfig
    .map(([key, cfg]) => {
      const color = cfg.theme
        ? undefined
        : cfg.color
      const lightColor = cfg.theme?.light ?? color
      const darkColor = cfg.theme?.dark ?? color
      return [
        lightColor ? `[data-chart=${id}] { --color-${key}: ${lightColor}; }` : '',
        darkColor
          ? `.dark [data-chart=${id}] { --color-${key}: ${darkColor}; }`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// ─── ChartContainer ──────────────────────────────────────────────────────────

type ChartContainerProps = React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <ChartStyle id={chartId} config={config} />
      <div
        data-chart={chartId}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          '[&_.recharts-cartesian-grid_line[stroke]]:stroke-border/50',
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          '[&_.recharts-dot[stroke]]:stroke-transparent',
          '[&_.recharts-layer]:outline-none',
          '[&_.recharts-polar-grid_[stroke]]:stroke-border',
          '[&_.recharts-radial-bar-background-sector]:fill-muted',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          '[&_.recharts-reference-line_[stroke]]:stroke-border',
          '[&_.recharts-sector[stroke]]:stroke-transparent',
          '[&_.recharts-sector]:outline-none',
          '[&_.recharts-surface]:outline-none',
          className
        )}
        {...props}
      >
        <ResponsiveContainer width='100%' height='100%'>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// ─── ChartTooltip ─────────────────────────────────────────────────────────────

export const ChartTooltip = Tooltip

// ─── ChartTooltipContent ─────────────────────────────────────────────────────

type ChartTooltipItem = {
  name?: string
  dataKey?: string | number
  value?: number | string
  color?: string
  payload?: Record<string, unknown> & { fill?: string }
}

type ChartTooltipContentProps = React.ComponentProps<'div'> & {
  active?: boolean
  payload?: ChartTooltipItem[]
  label?: React.ReactNode
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
  color?: string
  labelFormatter?: (
    value: React.ReactNode,
    payload: ChartTooltipItem[]
  ) => React.ReactNode
  formatter?: (
    value: number | string,
    name: string,
    item: ChartTooltipItem,
    index: number,
    payload: ChartTooltipItem[]
  ) => [React.ReactNode, React.ReactNode] | React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps & { labelClassName?: string }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const item = payload[0]
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === 'string'
      ? config[label as keyof typeof config]?.label ?? label
      : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value ?? label, payload)}
        </div>
      )
    }

    if (!value) return null

    return <div className={cn('font-medium', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className='grid gap-1.5'>
        {payload.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color ?? item.payload?.fill ?? item.color

          return (
            <div
              key={item.dataKey as string}
              className={cn(
                'flex w-full flex-wrap items-stretch gap-2',
                '[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center'
              )}
            >
              {formatter && item.value != null && item.name != null ? (
                formatter(item.value, item.name, item as { payload: Record<string, unknown>; color?: string }, index, payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn('shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]', {
                          'h-2.5 w-2.5': indicator === 'dot',
                          'w-1': indicator === 'line',
                          'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                          'my-0.5': nestLabel && indicator === 'dashed',
                        })}
                        style={{
                          '--color-bg': indicatorColor,
                          '--color-border': indicatorColor,
                        } as React.CSSProperties}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center'
                    )}
                  >
                    <div className='grid gap-1.5'>
                      {nestLabel ? tooltipLabel : null}
                      <span className='text-muted-foreground'>
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>
                    {item.value != null && (
                      <span className='font-mono font-medium tabular-nums text-foreground'>
                        {item.value.toLocaleString('ko-KR')}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ChartLegend ─────────────────────────────────────────────────────────────

export const ChartLegend = Legend

// ─── ChartLegendContent ──────────────────────────────────────────────────────

type ChartLegendItem = {
  value?: string
  dataKey?: string | number
  color?: string
}

type ChartLegendContentProps = React.ComponentProps<'div'> & {
  payload?: ChartLegendItem[]
  verticalAlign?: 'top' | 'bottom'
  hideIcon?: boolean
  nameKey?: string
}

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey ?? item.dataKey ?? 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value as string}
            className='flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className='h-2 w-2 shrink-0 rounded-[2px]'
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) return undefined

  const payloadObj = payload as Record<string, unknown>
  const payloadPayload = payloadObj.payload as Record<string, unknown> | undefined

  let configLabelKey = key

  if (
    key in config
  ) {
    configLabelKey = key
  } else if (
    payloadPayload &&
    typeof payloadPayload === 'object' &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}
