import React from 'react';
import axios from 'api/axios';
import { Upload, Icon, Modal, Button, Alert } from 'antd';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { UploadFile } from 'antd/lib/upload/interface';
import { TeamMember } from 'types';
import { getBase64 } from 'utils/blob';
import UserAvatar from 'components/UserAvatar';
import './AvatarEdit.less';

const FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const FILE_MAX_LOAD_MB = 10;

interface OwnProps {
  user: TeamMember;
  onDelete(): void;
  onDone(url: string): void;
}

const initialState = {
  isUploading: false,
  showModal: false,
  newAvatarUrl: '',
  loadError: '',
  uploadError: '',
};
type State = typeof initialState;

type Props = OwnProps;

export default class AvatarEdit extends React.PureComponent<Props, State> {
  state = initialState;
  cropperRef: React.RefObject<any>;
  constructor(props: Props) {
    super(props);
    this.cropperRef = React.createRef();
  }

  render() {
    const { newAvatarUrl, showModal, loadError, uploadError, isUploading } = this.state;
    const {
      user,
      user: { avatarUrl },
    } = this.props;
    return (
      <>
        {' '}
        <div className="AvatarEdit-avatar">
          <UserAvatar className="AvatarEdit-avatar-img" user={user} />
          <Upload
            name="avatar"
            showUploadList={false}
            action={this.handleLoad}
            beforeUpload={this.beforeLoad}
            onChange={this.handleLoadChange}
          >
            <Button className="AvatarEdit-avatar-change">
              <Icon
                className="AvatarEdit-avatar-change-icon"
                type={avatarUrl ? 'picture' : 'plus-circle'}
              />
              <div>{avatarUrl ? 'Change photo' : 'Add photo'}</div>
            </Button>
          </Upload>
          {avatarUrl && (
            <Button
              className="AvatarEdit-avatar-delete"
              icon="delete"
              shape="circle"
              onClick={this.props.onDelete}
            />
          )}
          {loadError && <Alert message={loadError} type="error" />}
        </div>
        <Modal
          title="Prepare your avatar"
          visible={showModal}
          footer={[
            <Button key="back" onClick={this.handleClose}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isUploading}
              onClick={this.handleUpload}
            >
              Upload
            </Button>,
          ]}
        >
          <Cropper
            ref={this.cropperRef}
            src={newAvatarUrl}
            style={{ height: 300 }}
            aspectRatio={1}
            guides={false}
            viewMode={1}
          />
          {uploadError && (
            <Alert
              message={uploadError}
              type="error"
              style={{ margin: '0.5rem 0 0 0' }}
            />
          )}
        </Modal>
      </>
    );
  }

  private handleClose = () => {
    this.setState({
      isUploading: false,
      showModal: false,
      newAvatarUrl: '',
      uploadError: '',
    });
  };

  private handleLoadChange = (info: any) => {
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, newAvatarUrl =>
        this.setState({
          newAvatarUrl,
        }),
      );
    }
  };

  private beforeLoad = (file: UploadFile) => {
    this.setState({ loadError: '' });
    const isTypeOk = !!FILE_TYPES.find(t => t === file.type);
    if (!isTypeOk) {
      this.setState({ loadError: 'File must be a jpg, png or gif' });
    }
    const isSizeOk = file.size / 1024 / 1024 < FILE_MAX_LOAD_MB;
    if (!isSizeOk) {
      this.setState({
        loadError: `File size must be less than ${FILE_MAX_LOAD_MB}MB`,
      });
    }
    return isTypeOk && isSizeOk;
  };

  private handleLoad = () => {
    this.setState({ showModal: true });
    return Promise.resolve();
  };

  private handleUpload = () => {
    this.cropperRef.current
      .getCroppedCanvas({ width: 400, height: 400 })
      .toBlob((blob: Blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        this.setState({ isUploading: true });
        axios
          .post('/api/v1/users/avatar', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(res => {
            this.props.onDone(res.data.url);
            this.handleClose();
          })
          .catch(err => {
            this.setState({ isUploading: false, uploadError: err.message });
          });
      });
  };
}
