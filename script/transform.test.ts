import { Transform } from './transform'

new Transform()
  .setMode('listToArrayTree')
  .read('China_Region_Last.ts')
  .trans()
  .write(
    'China_Region_Last_T.js',
    'window[\'$CONST_REGION\'] = ',
  )
