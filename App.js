import React, { useState } from 'react'
import { Switch, View, Text } from 'react-native'
import Advanced from './src/examples/Advanced'
import Simple from './src/examples/Simple'

const styles = {
  container: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -100,
  },
  instructionText: {
    marginRight: 10,
  }
}

export default function App () {
  const [showAdvanced, setShowAdvanced] = useState(true)

  return (
    <View style={styles.container}>
      {showAdvanced ? <Advanced /> : <Simple />}
      <View style={styles.row}>
        <Text style={styles.instructionText}>Show advanced example</Text>
        <Switch value={showAdvanced} onValueChange={setShowAdvanced} />
      </View>
    </View>
  )
}
