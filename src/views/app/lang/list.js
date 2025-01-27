import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
} from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import * as api from '../../../api';

import { loadAllLangs } from '../../../redux/actions';
import {
  menuPermission,
} from '../../../utils';

const UserList = ({ history, match, langs, loadAllLangsAction, permission, role }) => {
  // const [data, setData] = useState([]);
  const [refreshTable, setRefreshTable] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [delId, setDelId] = useState(-1);
  const [processing, setProcessing] = useState(false);

  const cols = [
    {
      Header: 'Name',
      accessor: 'name',
      cellClass: 'list-item-heading w-25',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Code',
      accessor: 'code',
      cellClass: 'text-muted  w-15',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Last Update',
      accessor: 'update_time',
      cellClass: 'text-muted  w-25',
      Cell: (props) => <>{new Date(props.value * 1000).toLocaleString()}</>,
    },
    {
      Header: 'Active',
      accessor: 'active',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <Badge
            color={props.value === 1 ? 'success' : 'danger'}
            pill
            className="mb-1"
          >
            {props.value === 1 ? 'Active' : 'Disabled'}
          </Badge>
        </>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'id',
      cellClass: 'text-muted  w-15',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            {menuPermission({role, permission}, 'lang.edit') && <i
              className="iconsminds-file-edit info"
              title="Edit"
              style={{ fontSize: 18 }}
              onClick={() => handleOnEdit(props.value)}
            />}
            {menuPermission({role, permission}, 'lang.edit') && <i
              className="simple-icon-cloud-download success"
              title="Download"
              style={{ fontSize: 18 }}
              onClick={() => handleOnDownload(props.value)}
            />}
            {menuPermission({role, permission}, 'lang.async') && <i
              className="simple-icon-refresh refresh"
              title="Synchronize"
              style={{ fontSize: 18 }}
              onClick={() => refreshLangKeys(props.value)}
            />}
            {menuPermission({role, permission}, 'lang.delete') && <i
              className="simple-icon-trash danger"
              title="Remove"
              style={{ fontSize: 18 }}
              onClick={() => handleOnDelete(props.value)}
            />}
          </div>
        </>
      ),
    },
  ];

  const loadData = ({ limit, page }) => {
    return api.r_loadLangRequest({ page, limit })
      .then(res => {
        const { data, pager, status, message } = res;
        if (status) {
          return {
            list: data.map(lang => ({
              ...lang
            })),
            pager,
          };
        } else {
          NotificationManager.error(message, 'Language');
        }
      });
  }

  const toAddPage = () => {
    history.push('/app/lang/add');
  };

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

  const handleOnEdit = (lang_id) => {
    history.push(`/app/lang/edit/${lang_id}`);
  };
  const handleOnDelete = (lang_id) => {
    setDelId(lang_id);
    setConfirm(true);
  };
  const deleteLanguage = async () => {
    if (delId > -1) {
      setConfirm(false);
      setDelId(-1);

      const result = await api.r_deleteLangRequest(delId);

      if (result.status) {
        NotificationManager.success(result.message, 'Delete Language');
      } else {
        NotificationManager.error(result.message, 'Delete Language');
      }
      reloadTableContent();
    } else {
      NotificationManager.warning(
        'No found language to delete!',
        'Delete Language'
      );
    }
  };
  const handleOnDownload = async (lang_id) => {
    const { data: lang, status } = await api.r_getLangRequest(lang_id);
    if (!status) {
      NotificationManager.warning(
        'Not found language info!',
        'Download Language'
      );
    } else {
      const json_res = await api.r_getLangFileContentRequest(lang_id);
      if (json_res.status !== undefined) {
        NotificationManager.error(json_res.message,'Download Content'); return;
      }
      downloadAsFile(json_res, `${lang.code}.json`);
    }
  };
  const downloadAsFile = (json, download_name) => {
    const res = JSON.stringify(json);
    const data = new Blob([res], { type: 'text/csv' });
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', download_name);
    tempLink.click();
  };
  const refreshLangKeys = async (lang_id) => {

    setProcessing(true);

    const res = await api.r_syncLangRequest(lang_id);

    setProcessing(false);

    if (res.status === true) {
      NotificationManager.success(res.message);
    } else {
      NotificationManager.error(res.message);
    }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.languages" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.languages" />
          </h3>
        </Colxx>

        <Colxx className="d-flex justify-content-end" xxs={12}>
          <Button color="primary" className="mb-2" onClick={toAddPage}>
            <i className="simple-icon-plus mr-1" />
            <IntlMessages id="actions.add" />
          </Button>{' '}
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard 
            cols={cols}
            loadData={loadData}
            refresh={refreshTable}
            />
        </Colxx>
      </Row>

      {/* Confirm Delete */}
      <Modal
        isOpen={confirm}
        toggle={() => setConfirm(!confirm)}
        backdrop="static"
      >
        <ModalHeader>Confirm</ModalHeader>
        <ModalBody>Are you sure to remove this language?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={deleteLanguage}>
            Ok
          </Button>{' '}
          <Button color="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Loading & Please wait */}
      <Modal
        isOpen={processing}
        toggle={() => setProcessing(!processing)}
        backdrop="static"
      >
        <ModalHeader>Alert</ModalHeader>
        <ModalBody>
          <span className="spinner d-inline-block">
            <span className="bounce1" />
            <span className="bounce2" />
            <span className="bounce3" />
          </span>
          Processing. Pleaset wait...
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ langs: langApp, auth }) => {
  const { list: langs } = langApp;
  const { permission, info: { role } } = auth;

  return {
    langs,
    permission,
    role,
  };
};

export default connect(mapStateToProps, {
  loadAllLangsAction: loadAllLangs,
})(UserList);
