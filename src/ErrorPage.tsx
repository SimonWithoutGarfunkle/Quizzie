import Lottie from './Lottie'
import { TitleBar, StatusBar } from './WindowChrome'
import notFoundAnim from './animations/404 error page with cat.json'

const ANIM_SIZE_PX = 420

export default function ErrorPage() {
  return (
    <div className="window">
      <TitleBar title="ERROR.EXE" />
      <div className="window-body window-body--center">
        <Lottie animationData={notFoundAnim} loop style={{ width: ANIM_SIZE_PX, height: ANIM_SIZE_PX * 0.9 }} />
      </div>
      <StatusBar left="Page introuvable" right="Erreur 404" />
    </div>
  )
}
