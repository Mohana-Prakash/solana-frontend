import { Button, Modal } from 'react-bootstrap';


const ModalView = ({title=null,footer=true,content=null,button=null,onOpen=null,open=false,onClose=null,onSuccess=null, className=null, classHeader=null, closeButton=true}) => {

  return (
    <>
      {button && <button type='button' onClick={onOpen} className='btn btn-primary'>{button}</button>}

      <Modal className={className} show={open} onHide={onClose} backdrop="static" keyboard={false} >
        <Modal.Header className={classHeader}closeButton={closeButton}><Modal.Title >{title}</Modal.Title></Modal.Header>
        <Modal.Body >{content}</Modal.Body>
        {footer && <Modal.Footer>
          <Button variant='secondary' onClick={onClose}>Close</Button>
          <Button variant='primary' onClick={onSuccess}>Understood</Button>
        </Modal.Footer>}
      </Modal>
    </>
  );
};

export default ModalView;