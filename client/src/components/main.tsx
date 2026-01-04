import type { ComponentProps } from "react"

const Main = (props:Omit<ComponentProps<"div">,"className">)=> <div {...props} className="md:shadow-2xl max-w-160 mx-auto min-h-screen px-6 flex items-center justify-center" />

export default Main 