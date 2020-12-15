import React from 'react';
import { BasePropertyProps } from 'admin-bro';
import { Box, Label,  TextArea} from '@admin-bro/design-system'


class Edit extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            lineCount: 0,
        }

        this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    }


     handleTextAreaChange($event) {
        const lines = $event.target.value.split(/\r*\n/);
        this.setState({lineCount: lines.length });
    }


    render(){
        return (
            <div>
                <Box>
                    <Label htmlFor="textArea">Base de dados</Label>
                    <TextArea onChange={this.handleTextAreaChange} id="textArea" width={1/1} height='125px'></TextArea>
                </Box>
                <Box>
                    {this.state.lineCount} registros adicionados
                </Box>
            </div>
        )
    }
}

export default Edit;