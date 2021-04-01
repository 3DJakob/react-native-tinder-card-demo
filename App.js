import React, { useState } from 'react'
import { Switch } from 'react-native'
import Advanced from './src/examples/Advanced'
import Simple from './src/examples/Simple'
import styled from 'styled-components'

const Container = styled.View`
  min-height: 100%;
  justify-content: center;
  align-items: center;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const InstructionText = styled.Text`
  margin-right: 10px;
`

export default function App () {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <Container>
      {showAdvanced ? <Advanced /> : <Simple />}
      <Row>
        <InstructionText>Show advanced example</InstructionText>
        <Switch value={showAdvanced} onValueChange={setShowAdvanced} />
      </Row>
    </Container>
  )
}
