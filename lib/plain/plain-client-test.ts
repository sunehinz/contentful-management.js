import chai, { expect } from 'chai'
import { describe } from 'mocha'
import Sinon from 'sinon'
import { Adapter, createClient } from '../contentful-management'
import sinonChai from 'sinon-chai'
import { CommentNode, RichTextCommentDocument } from '../entities/comment'

chai.should()
chai.use(sinonChai)

type Props = {
  commentId: string
  entryId: string
  bodyFormat: string
  spaceId: string
  environmentId: string
}

describe('Plain Client', () => {
  const stub = Sinon.stub()
  const defaultProps: Props = {
    commentId: '123',
    entryId: '123',
    bodyFormat: 'plain-text',
    spaceId: '123',
    environmentId: '123',
  }

  beforeEach(() => stub.reset())

  const apiAdapter: Adapter = {
    makeRequest: (args) => {
      return stub.returns(Promise.resolve())(args)
    },
  }

  const plainClient = createClient({ apiAdapter }, { type: 'plain' })

  describe('Comment', () => {
    describe('when body is plain text', () => {
      const props = {
        ...defaultProps,
        bodyFormat: 'plain-text',
      } as any
      const updateText = 'My new text'

      it('should create a get object', async () => {
        await plainClient.comment.get(props)
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'get',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })

      it('should create a getMany object', async () => {
        await plainClient.comment.getMany(props)
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'getMany',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })

      it('should create a create object', async () => {
        await plainClient.comment.create(props, { body: updateText })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'create',
          params: props,
          payload: { body: updateText },
          headers: undefined,
        })
      })

      it('should create a update object', async () => {
        await plainClient.comment.update(props, {
          body: updateText,
          sys: { version: 2 },
          status: 'active',
        })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'update',
          params: props,
          payload: { body: updateText },
          headers: undefined,
        })
      })

      it('should create a delete object', async () => {
        await plainClient.comment.delete({ ...props, version: 2 })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'delete',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })
    })

    describe('when body is rich text', () => {
      const richTextBody: RichTextCommentDocument = {
        data: {},
        nodeType: CommentNode.Document,
        content: [
          {
            nodeType: CommentNode.Paragraph,
            data: {},
            content: [
              {
                nodeType: 'text',
                marks: [],
                data: {},
                value: 'My comment',
              },
              {
                nodeType: CommentNode.Mention,
                data: {
                  target: {
                    sys: { type: 'Link', id: '123', linkType: 'User' },
                  },
                },
                content: [
                  {
                    nodeType: 'text',
                    marks: [],
                    data: {},
                    value: 'My user mention',
                  },
                ],
              },
              {
                nodeType: CommentNode.Mention,
                data: {
                  target: {
                    sys: { type: 'Link', id: '456', linkType: 'Team' },
                  },
                },
                content: [
                  {
                    nodeType: 'text',
                    marks: [],
                    data: {},
                    value: 'My team mention',
                  },
                ],
              },
              {
                data: {},
                marks: [],
                value: '.',
                nodeType: 'text',
              },
            ],
          },
        ],
      }

      const props = {
        ...defaultProps,
        bodyFormat: 'rich-text',
      } as any

      it('should create a get object', async () => {
        await plainClient.comment.get(props)
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'get',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })

      it('should create a getMany object', async () => {
        await plainClient.comment.getMany(props)
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'getMany',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })

      it('should create a create object', async () => {
        await plainClient.comment.create(props, { body: richTextBody })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'create',
          params: props,
          payload: { body: richTextBody, status: 'active' },
          headers: undefined,
        })
      })

      it('should create a update object', async () => {
        await plainClient.comment.update(props, {
          body: richTextBody,
          sys: { version: 2 },
          status: 'active',
        })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'update',
          params: props,
          payload: { body: richTextBody, status: 'active' },
          headers: undefined,
        })
      })

      it('should create a delete object', async () => {
        await plainClient.comment.delete({ ...props, version: 2 })
        expect(stub).to.have.been.calledWithMatch({
          entityType: 'Comment',
          action: 'delete',
          params: props,
          payload: undefined,
          headers: undefined,
        })
      })
    })
  })
})
