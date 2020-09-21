import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
} from 'reactstrap';

import {
  AvForm,
} from 'availity-reactstrap-validation';
import { Lines } from 'react-preloaders';


import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import {
  deleteAdminNotiByIdRequest,
  updateUserProfile,
} from '../../../utils';
import { loadAllUsers, loadAllAdminNotiAction } from '../../../redux/actions';


const IDTransferList = ({
  match,
  history,
  friends,
  notifications,
  posts,
  users,
  loadAllUsersAction,
  loadAllAdminNotiAction$,
}) => {
  // Table Data
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);

  // for Delete Modal
  const [delId, setDeleteId] = useState(-1);
  const [delModal, setDelModal] = useState(false);

  const cols = [
    {
      Header: 'User',
      accessor: 'user',
      cellClass: 'list-item-heading w-15',
      Cell: (props) => (
        <>
          <div className="text-center">
            <img
              src={getUserAvatarUrl(props.value)}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              alt={props.value.user_name} /> <br />
            <Link to={`/app/user/edit/${props.value.user_id}`}>
              {props.value.user_name}
            </Link> <br />
          </div>
        </>
      ),
    },
    {
      Header: 'Original Info',
      accessor: 'fromUser',
      cellClass: 'list-item-heading w-15',
      Cell: (props) => (
        <>
          <div className="text-center">
            <div><label><b>Card Number</b>:</label>{' '}{props.value.card_number}</div>

            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{ maxWidth: 200 }}
              alt="ID Card" />}
          </div>
        </>
      ),
    },
    {
      Header: 'New Info',
      accessor: 'toUser',
      cellClass: 'list-item-heading w-10',
      Cell: (props) => (
        <>
          <div className="text-center">
            <div><label>Card Number:</label>{' '}{props.value.card_number}</div>

            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{ maxWidth: 200 }}
              alt="ID Card" />}
          </div>
        </>
      ),
    },
    {
      Header: 'Verified',
      accessor: 'verified',
      cellClass: 'list-item-heading w-10',
      Cell: (props) => (
        <>
          <Badge
            color={props.value === 1 ? 'outline-success' : 'outline-danger'}
            pill
            className="mb-1"
            >
            {props.value === 1 ? 'Verified' : 'Unverified'}
          </Badge>
        </>
      )
    },
    {
      Header: 'Actions',
      accessor: 'action',
      cellClass: 'text-muted  w-10',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
          {!props.value.verified && (
              <i
                className="iconsminds-security-check success"
                title="Verify Now"
                style={{ fontSize: 18 }}
                onClick={() => verifyUserById(props.value.user_id)}
              />
            )}
            {props.value.verified === 1 && (
              <i
                className="iconsminds-security-bug danger"
                title="Unverify Now"
                style={{ fontSize: 18 }}
                onClick={() => UnverifyUserById(props.value.user_id)}
              />
            )}
            {(
              <i
                className="simple-icon-trash danger"
                title="Delete Request"
                style={{ fontSize: 18 }}
                onClick={() => deleteIDChange(props.value.noti_id)}
              />
            )}
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    recomposeIDTransfer();
    return () => {
      return true;
    };
  }, [match, users, notifications, recomposeIDTransfer]);

  useEffect(() => {
    loadAllAdminNotiAction$();
    return () => { };
  }, [match]);

  const recomposeIDTransfer = () => {
    let idTransfers = notifications.filter(noti => noti.type === '13');
    let format_data = [];
    for (let transfer of idTransfers) {
      let newItem = {};
      // copy all fields to new object
      Object.keys(transfer).forEach((key, i) => newItem[key] = transfer[key]);

      const user = getUserById(transfer.new.user_id);
      newItem.type = transfer.type;
      newItem.noti_id = transfer.noti_id;
      newItem.fromUser = transfer.old;
      newItem.toUser = transfer.new;
      newItem.user = transfer.new;
      newItem.verified = user.verified || 0;
      newItem.action = {
        noti_id: transfer.noti_id,
        verified: user.verified || 0,
        user_id: transfer.new.user_id,
      };
      format_data.push(newItem);
    }
    setData(format_data);
  };
  const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
    if (photo) {
      return photo;
    }
    if (avatarIndex !== undefined && avatarIndex !== '') {
      return `/assets/avatar/${sex === '1' ? 'girl' : 'boy'
        }/${avatarIndex}.png`;
    }
    return `/assets/avatar/avatar_${sex === '1' ? 'girl2' : 'boy1'}.png`;
  };
  const verifyUserById = async (user_id) => {
    try {
      // history.push(`/app/user/edit/${user_id}`);
      const usersF = users.filter((user) => user.user_id === user_id);
      console.log(usersF[0]);
      const profile = usersF[0];
      profile.verified = 1;

      setPreloading(true);
      const res = await updateUserProfile(profile);
      setPreloading(false);

      if (res.status === true) {
        NotificationManager.success('User has been verified', 'Verification');
        loadAllUsersAction();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error(
        'Error while updating verification!',
        'Verification'
      );
    }
  };
  const UnverifyUserById = async (user_id) => {
    try {
      const usersF = users.filter((user) => user.user_id === user_id);
      const profile = usersF[0];
      profile.verified = 0;

      setPreloading(true);
      const res = await updateUserProfile(profile);
      setPreloading(false);

      if (res.status === true) {
        NotificationManager.success('User has been unverified', 'Verification');
        loadAllUsersAction();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error(
        'Error while updating verification!',
        'Verification'
      );
    }
  };
  const deleteIDChange = (id) => {
    setDeleteId(id);
    setDelModal(true);
  }
  const confirmDeleteIDChange = () => {
    console.log(delId);
    setLoading(true);
    deleteAdminNotiByIdRequest(delId) 
      .then(res => {
        setLoading(false);
        if (res.status === true) {
          NotificationManager.success('Data has been deleted!', 'ID Changes');
          setDelModal(false);
          loadAllAdminNotiAction$();
        } else {
          NotificationManager.error('Failed to delete data!', 'ID Changes')
        }
      })
      .catch(error => {
        console.log('[Del ID Transfer]', error.message);
        setLoading(false);
        NotificationManager.error('Something went wrong!', 'ID Changes');
      });
  }
  const getUserById = (id) => {
    const filtered = users.filter(user => user.user_id === id);
    return filtered.length > 0 ? filtered[0] : {};
  }
  const getNewNotificationId = () => {
    let newId = -1;
    for (const noti of notifications) {
      newId = noti.noti_id > newId ? noti.noti_id : newId;
    }
    return newId + 1;
  };


  return (
    <>
      <Lines
        background='blur'
        color="#fff"
        customLoading={preloading}
        time={0}
      />
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.id-changes" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.id-changes" />
          </h3>
        </Colxx>


        <Colxx xxs="12">
          <ReactTableWithPaginationCard cols={cols} data={data} />
        </Colxx>
      </Row>

      {/* Delete Modal */}
      <Modal
        isOpen={delModal}
        toggle={() => setDelModal(!delModal)}
        backdrop="static"
      >
        <ModalHeader>Delete ID Change</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
          >
            <h5>Are you sure to delete it?</h5>

            <Separator className="mb-5 mt-5" />
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
                  }`}
                size="lg"
                onClick={confirmDeleteIDChange}
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">Confirm</span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setDelModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

    </>
  );
};

const mapStateToProps = ({
  friends: friendApp,
  posts: postApp,
  users: userApp,
  adminNotifications: { list: notifications }
}) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;
  const { list: friends } = friendApp;

  return {
    friends,
    notifications,
    users,
    posts,
  };
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
  loadAllAdminNotiAction$: loadAllAdminNotiAction,
})(IDTransferList);