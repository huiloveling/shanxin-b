import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import styles from './index.less';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach((column) => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      needTotalList,
    };
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter);
  }

  render() {
    const { data, loading, columns, scroll} = this.props;
    const hidePagination = data.hidePagination ? data.hidePagination : null ;
    const paginationProps = {
      showSizeChanger: true,
//      showQuickJumper: true,
      total: data.total,
      current: data.current,
      pageSize: data.size
    };
    columns.forEach(c => {
      if(!c.align) {
        c.align = "center";
      }
    })
    return (
      <div className={styles.standardTable}>
        <Table
          bordered={true}
          loading={loading}
          rowKey={record => record.id}
          dataSource={data.records}
          columns={columns}
          pagination={hidePagination ? !hidePagination : paginationProps}
          scroll={scroll}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
