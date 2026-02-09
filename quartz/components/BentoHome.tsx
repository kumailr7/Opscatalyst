import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/bento.inline"
import bentoStyle from "./styles/bento.scss"

const BentoHome: QuartzComponent = (_props: QuartzComponentProps) => null

BentoHome.afterDOMLoaded = script
BentoHome.css = bentoStyle

export default (() => BentoHome) satisfies QuartzComponentConstructor
