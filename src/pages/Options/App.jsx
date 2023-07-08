import {
    HashRouter as Router,
    Route,
    Switch,
    useParams
} from "react-router-dom";
import React from 'react'
import Options from './src/options'
import User from './src/user'
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';

const App = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <Router>
                <Switch>
                    <Route path="/">
                        <Options />
                    </Route>
                </Switch>
            </Router>
        </ConfigProvider>
    )
}

export default App
