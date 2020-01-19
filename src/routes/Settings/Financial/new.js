import React, { Component } from 'react'
import axios from 'axios'
import '../style/scr.css'

export class Scr extends Component {
    constructor(){
        super();
        this.state={
            data:[],
            // onMore:true,
            offset:0
        }
    }
    componentWillMount(){
        this.getData(this.state.offset)
        console.log('触发')
        document.addEventListener('scroll',this.more.bind(this))
    }
    more(){
        if(this.state.onMore){
            return;
        }
        let scrollTop=document.documentElement.scrollTop||document.body.scrollTop
        if(window.document.body.offsetHeight==window.screen.height+scrollTop){
            console.log('到底')
            this.state.offset+=20
            this.getData(this.state.offset)
        }
    }
    getData(offset){
        axios.get("http://elm.cangdu.org/shopping/restaurants?latitude=45.80031&longitude=126.50329&offset="+offset+"&limit=20&extras[]=activities&keyword=&restaurant_category_id=&restaurant_category_ids[]=&order_by=&delivery_mode[]=")
            .then(res=>{
        // console.log(res.data)
        // if(res.data.length<20){
        // this.state.onMore=false
        // }
            this.setState({
                data:this.state.data.concat(res.data)
            })
        })
    }
    render() {
        return (
            <div className="mm">
                <ul>
                    {
                        this.state.data.map((item,index)=>{
                            return(
                                <li key={index}>{item.name}</li>
                            )
                        })
                    }
                </ul>
                <div>加载中...</div>
            </div>
        )
    }
}

export default Scr
