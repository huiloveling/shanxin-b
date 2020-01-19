import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import {Button, Card, Col, DatePicker, Divider, Form, Row, Select} from 'antd';
import styles from '../../../assets/less/List.less';
import StandardTable from '../../../components/StandardTable';
import {cons} from '../../../common/constant';
import flowRecord from './../../../utils/flowRecord'

const { MonthPicker} = DatePicker;
const FormItem = Form.Item;

@connect(({salaryHistory,company, loading}) => ({
  salaryHistory,
  company,
  loading: loading.models.salaryHistory,
}))
@Form.create()
export default class SalaryHistory extends PureComponent {
  state = {
    stateValue: '1,2,3',
    searchParams: {
      startDate: null,  //起始时间，单位毫秒
      endDate: null,
      companyId: null
    }
  }

  componentWillMount() {
    flowRecord();
    this.handleRefresh();
  }

  /**
   * 执行初始化操作，因为在 handleRefresh 和 handleSearchReset 方法里要执行同样的操作，因此抽成一个方法
   */
  handleRefresh() {
    this.props.dispatch({
      type:'salaryHistory/list',
      payload: {
        state: this.state.stateValue,
        descs: 'id'
      }
    });

    this.props.dispatch({
      type:'company/all',
      payload:{}
    })
  }

  /**
   * 处理表格的分页，过滤，排序器
   * @param pagination
   * @param filtersArg
   * @param sorter
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch} = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...this.state.searchParams,
      ...filters,
    };
    if (sorter.field) {
      if (sorter.order == 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    } else {
      params.descs = 'id';
    }
    dispatch({
      type: 'salaryHistory/list',
      payload: {
        state: this.state.stateValue,
        ...params
      },
    });
  }

  /**
   * 重置搜索框
   */
  handleSearchReset = () => {
    const {form, dispatch} = this.props;
    form.resetFields();
    this.setState({searchParams:{startDate:null,endDate:null, companyId:null}});
    this.handleRefresh();
  }

  downloadSalaryFile = (record) =>{
    const {startDate, endDate} = record;
    const date = startDate == endDate ? startDate: (startDate + ' 至 ' +endDate);
    const url = cons.url.base_url + '/salary/batch/download/file?salaryId=' + record.id + '&fileName=' + record.company.name + date + '发薪明细';
    location.href = encodeURI(url);
  }

  /**
    * 处理历史记录页面查询的函数
   */
  handleSearch = (e) => {
    e.preventDefault();

    const {dispatch, form} = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //取出表中字段
      const values = {
        ...fieldsValue
      };
      //取出 年 月
      let startDateMills = values.startDate?Date.parse(values.startDate.toString()):null;
      let endDateMills = values.endDate?Date.parse(values.endDate.toString()):null;
      this.setState({searchParams:{startDate:startDateMills,endDate:endDateMills, companyId:values.companyId}});
      // 向服务器请求数据
      dispatch({
        type:'salaryHistory/list',
        payload: {
          state: this.state.stateValue,
          companyId:values.companyId,
          startDate:startDateMills,
          endDate:endDateMills,
          descs: 'id',
        },
      });
    });
  }

  /**
   * 渲染页面
   * @returns {JSX}
   */
  render() {
    const {salaryHistory:{data}, loading}= this.props;  //正式上线使用
    const {getFieldDecorator} = this.props.form;
    const Option = Select.Option;
    const {allCompanies} = this.props.company;

    const columns =[
      {
        title: '记录编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '企业名称',
        dataIndex: 'company.name',
        width: '220px'
      },
      {
        title: '发工资月份',
        dataIndex: 'startDate',
        render: (text, record) => {
          const {startDate, endDate} = record;
          return startDate == endDate ? startDate: (startDate + ' 至 ' +endDate);
        }
      },
      {
        title: '发放人数',
        dataIndex: 'totalCount',
      },
      {
        title: '发放金额（元）',
        dataIndex: 'totalMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '未成功人数',
        dataIndex: 'failCount',
      },
      {
        title: '未成功金额（元）',
        dataIndex: 'failMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '操作人',
        dataIndex: 'uploadUser.realName',
      },
      {
        title: '发薪状态',
        dataIndex: 'state',
        render:(text)=>{
          // 0待发薪 1发放中 2发放成功 3发放失败
          if(text=="0")
            return "待发薪";
          if(text=="1")
            return "发薪中";
          if(text=="2")
            return "已发薪";
          if(text=="3")
            return "发薪失败";
        }
      },
      {
        title: '操作时间',
        dataIndex: 'uploadTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <Link to={'/salary/salaryHistory/detail/'+record.id+"/"+record.company.id}>查看详情</Link> <Divider type="vertical"/>
            <a onClick={() =>{this.downloadSalaryFile(record)}}>下载发薪文件</a>
          </span>
        ),
      },];

    return (
         <Card bordered={false}>
           {/*搜索栏*/}
           <Form onSubmit={this.handleSearch} layout="inline">
             <Row>
               <Col  md={6} sm={16}>
                 <FormItem label="公司名称">
                   {getFieldDecorator('companyId',{
                     initialValue:null,
                   })(
                     //<Input placeholder="请输入"/>
                     <Select allowClear={true} style={{ width: '200px' }} placeholder="请选择" >
                       {/*(<Option key={i+""} value={values[i]}>{contents[i]}</Option>);*/}
                       {allCompanies?allCompanies.map(item => {
                         return (<Option key={item.id} value={item.id}>{item.name}</Option>)
                       }):null}
                     </Select>
                   )}
                 </FormItem>
               </Col>
               <Col  md={9} sm={16}>
                 <FormItem label="发薪区间">
                   {getFieldDecorator('startDate')(
                     <MonthPicker placeholder="请选择起始时间"/>
                   )}
                 </FormItem>
                 <FormItem label="">
                   {getFieldDecorator('endDate')(
                     <MonthPicker placeholder="请选择结束时间"/>
                   )}
                 </FormItem>
               </Col>
               <Col   md={6} sm={16}>
                  <span className={styles.submitButtons}>
                    <Button type="primary" htmlType="submit">查询</Button>
                    <Button style={{marginLeft: 8, marginTop:4}} onClick={this.handleSearchReset}>重置</Button>
                  </span>
               </Col>
             </Row>
           </Form>

           <Row style={{ marginTop:32}}>
             {/*生成表格*/}
             <StandardTable
               loading={loading}
               data={data}
               columns={columns}
               onChange={this.handleStandardTableChange}
             />
           </Row>
        </Card>
    )
  }
}
