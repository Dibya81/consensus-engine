import aws_cdk as core
import aws_cdk.assertions as assertions

from consensus_bedrock.consensus_bedrock_stack import ConsensusBedrockStack

# example tests. To run these tests, uncomment this file along with the example
# resource in consensus_bedrock/consensus_bedrock_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = ConsensusBedrockStack(app, "consensus-bedrock")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
