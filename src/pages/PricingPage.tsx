import { Card, Row, Col, Button, List, Tag } from 'antd'
import { CheckOutlined, CrownOutlined, RocketOutlined } from '@ant-design/icons'

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic voice planning (7 days)',
        'Auto-generated schedule',
        'One-way calendar sync',
        'Daily insights (3 max)',
        '7-day history',
        'Ad-supported',
      ],
      buttonText: 'Current Plan',
      buttonType: 'default' as const,
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For serious productivity enthusiasts',
      features: [
        'Unlimited voice interactions',
        'Deep personalized analysis',
        'Unlimited AI insights',
        'Goals & habits tracking',
        'Unlimited history',
        'Energy curve analysis',
        'Two-way calendar sync',
        'Priority support',
        'Ad-free experience',
        'Advanced integrations',
      ],
      buttonText: 'Upgrade to Premium',
      buttonType: 'primary' as const,
      popular: true,
      yearlyPrice: '$79.99/year (Save 33%)',
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      description: 'For power users and teams',
      features: [
        'Everything in Premium',
        'Custom AI coach personality',
        'Custom workflow creation',
        'Deep productivity reports',
        'API access',
        'White-label options',
      ],
      buttonText: 'Upgrade to Pro',
      buttonType: 'default' as const,
      popular: false,
      yearlyPrice: '$159.99/year (Save 33%)',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mt-4">
          Unlock your full productivity potential with AI-powered insights
        </p>
      </div>

      <Row gutter={[24, 24]} className="mt-8">
        {plans.map((plan) => (
          <Col xs={24} lg={8} key={plan.name}>
            <Card
              className={`h-full ${plan.popular ? 'border-primary-500 border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="text-center -mt-4 mb-4">
                  <Tag color="blue" className="text-sm px-4 py-1">
                    <CrownOutlined /> MOST POPULAR
                  </Tag>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/ {plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-green-600 mt-2">{plan.yearlyPrice}</p>
                )}
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <Button
                type={plan.buttonType}
                size="large"
                block
                icon={plan.popular ? <RocketOutlined /> : undefined}
                className="mb-6"
              >
                {plan.buttonText}
              </Button>

              <List
                dataSource={plan.features}
                renderItem={(feature) => (
                  <List.Item className="border-0 py-2">
                    <CheckOutlined className="text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 mt-8">
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Not sure which plan is right for you?
          </h3>
          <p className="text-gray-600 mb-6">
            Start with our free plan and upgrade anytime. No credit card required.
          </p>
          <Button size="large" type="primary">
            Start Free Trial
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PricingPage
